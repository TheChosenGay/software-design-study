# 专题2：缓存系统设计 — 完整答案

## 一、整体架构

```
客户端（App/Web）
    ↓ 本地缓存（LRU/容量限制）
    
服务端：
  读操作 → Redis → (miss) → 数据库
  写操作 → 数据库 → (同步/异步) → Redis
```

---

## 二、缓存层级

| 层级 | 组件 | 命中率 | 延迟 |
|------|------|--------|------|
| L1 | 客户端本地缓存 | 视业务而定 | <1ms |
| L2 | Redis | 50%-90% | <5ms |
| L3 | 数据库 | - | 10-50ms |

---

## 三、Key 设计

```
# 商品详情
product:detail:{product_id}

# 用户会话
session:{user_id}

# 购物车
cart:{user_id}
```

**注意**：冒号 `:` 是 Redis key 的合法字符，用于分层组织。

---

## 四、数据更新策略

### 被动拉取（读多写少）

```
1. 客户端先读本地缓存
2. 本地 miss → 请求服务端
3. 服务端查 Redis
4. Redis miss → 查数据库，写入 Redis
5. 返回数据，更新客户端缓存
```

### 主动推送（读多写多/一致性要求高）

```
1. 商品信息更新
2. 写数据库
3. 删除/更新 Redis（cache aside）
4. 推送版本号通知所有在线客户端
5. 客户端下次访问时验证版本，发现变更后更新本地缓存
```

### 版本号机制

```
商品信息：
{
  "id": "p123",
  "version": 56,
  "price": 99.9
}

客户端缓存：
{
  "id": "p123",
  "version": 55,
  "cached_price": 98.0
}

客户端验证流程：
1. 请求 GET /product/p123/version
2. 服务端返回 {version: 56}
3. 发现本地 55 < 远端 56
4. 下载完整数据更新本地缓存
```

---

## 五、穿透/击穿/雪崩

### 穿透：查询不存在的数据

**问题**：大量请求查询不存在的数据，每次都打到数据库。

**方案**：

```python
def get_product(product_id):
    # 1. 查 Redis
    value = redis.get(f"product:detail:{product_id}")
    if value:
        return value
    
    # 2. 查数据库
    product = db.query("SELECT * FROM products WHERE id = ?", product_id)
    
    if product:
        # 存在，写入缓存
        redis.setex(f"product:detail:{product_id}", ttl, product)
        return product
    else:
        # 不存在，写入空值标记（防穿透）
        redis.setex(f"product:detail:{product_id}", short_ttl, "NULL")
        return None
```

**空值缓存 TTL**：设短一点（30秒-5分钟），防止长期存储无效数据。

---

### 击穿：热点 key 过期，瞬间大量请求打到数据库

**问题**：某个热点商品缓存过期瞬间，所有请求都去查数据库。

**方案A：永不过期 + 异步更新**

```python
def get_product(product_id):
    value = redis.get(f"product:detail:{product_id}")
    if value == "NULL":
        return None
    if value:
        return value
    
    # 回源
    product = db.query(product_id)
    if product:
        # 不设过期时间，定期异步刷新
        redis.set(f"product:detail:{product_id}", product)
        return product
    
    return None

# 定时任务刷新热点数据
def refresh_hot_products():
    hot_products = get_hot_products()  # 从访问日志得出
    for p in hot_products:
        redis.set(f"product:detail:{p.id}", p)
```

**方案B：互斥锁**

```python
import redis

def get_product(product_id):
    value = redis.get(f"product:detail:{product_id}")
    if value:
        return value
    
    lock_key = f"lock:product:detail:{product_id}"
    
    # 尝试获取锁
    lock = redis.set(lock_key, "1", nx=True, ex=10)
    if lock:
        try:
            # 只有一个请求回源
            product = db.query(product_id)
            redis.setex(f"product:detail:{product_id}", ttl, product)
            return product
        finally:
            redis.delete(lock_key)
    else:
        # 其他请求等待后重试
        time.sleep(0.1)
        return get_product(product_id)
```

---

### 雪崩：大量 key 同时过期

**问题**：大量缓存 key 设了相同的过期时间，到期后同时失效。

**方案**：

```python
# 给 TTL 加随机偏移
base_ttl = 3600  # 1小时
actual_ttl = base_ttl + random.randint(0, 1800)  # 1小时~1.5小时

redis.setex(key, actual_ttl, value)
```

**热点数据多副本**：

```python
# 同一个数据存多个 key，TTL 不同
redis.setex(f"product:detail:{id}:v1", 3600, data)
redis.setex(f"product:detail:{id}:v2", 5400, data)  # 晚失效
redis.setex(f"product:detail:{id}:v3", 7200, data)  # 更晚失效
```

---

## 六、大促缓存架构

### 场景：10万 QPS

**Q1：Redis 单实例能抗住吗？**

可以。Redis 单实例 QPS 10万+ 没问题。

但集群是为了**可用性**，不是**性能**。

**Q2：Redis Cluster vs 代理模式**

| 对比 | Redis Cluster | Twemproxy/Codis |
|------|---------------|-----------------|
| 架构 | 无中心，直连各节点 | 有代理，转发请求 |
| 跨 Key 操作 | 不支持 | 支持 |
| 运维复杂度 | 高 | 低 |
| 适用 | 小规模、多语言 | 中大规模、批量操作多 |

**Q3：大促预热**

```python
def preheat_cache():
    # 1. 从促销系统获取活动商品
    promotion_products = get_promotion_products()  # 10万个
    
    # 2. 分批次预热，每批1000个
    batch_size = 1000
    for i in range(0, len(promotion_products), batch_size):
        batch = promotion_products[i:i+batch_size]
        
        # 从数据库批量读取
        products = db.batch_get(batch)
        
        # 批量写入 Redis
        pipe = redis.pipeline()
        for p in products:
            key = f"product:detail:{p.id}"
            pipe.setex(key, longer_ttl, p)
        pipe.execute()
        
        print(f"预热进度: {i+batch_size}/{len(promotion_products)}")
        time.sleep(5)  # 控制速度，不打爆数据库
```

---

## 七、你的薄弱点

| 薄弱点 | 说明 |
|--------|------|
| Redis 数据结构选型 | 范围查询用 ZSET，不是 String/Hash |
| 客户端缓存一致性 | 版本号机制是标准做法 |
| 双写一致性 | 没有真正的事务，正确的是"补偿模式" |
| 缓存问题场景化 | 穿透/击穿/雪崩的解决方案和适用场景 |
| Redis 集群 | Cluster vs 代理模式的选择依据 |
| 预热策略 | 速度控制、验证机制 |
