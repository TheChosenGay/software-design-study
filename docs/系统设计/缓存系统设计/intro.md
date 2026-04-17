# 缓存系统设计

## 题目

**场景：**
电商系统，商品详情页访问量巨大，商品信息变更不频繁

**请设计：**
1. 缓存整体架构（多少层、用什么缓存）
2. 缓存 Key 怎么设计
3. 缓存数据怎么更新（主动推送 vs 被动拉取）
4. 缓存问题怎么解决（穿透、击穿、雪崩）

**评估维度：**
- 性能
- 一致性
- 成本

---

<details>
<summary><strong>💡 提示：应该从哪些方面考虑？</strong></summary>

**1. 缓存架构**
- 客户端缓存 vs 服务端缓存？
- 本地缓存用什么？（LRU？容量限制？）
- Redis 多实例还是集群？

**2. Key 设计**
- 按什么维度组织？
- 命名规范？

**3. 数据更新**
- 读流程是什么？
- 写流程是什么？
- 客户端缓存怎么保证一致性？（版本号？推送？）

**4. 缓存问题**
- 穿透：查询不存在的数据
- 击穿：热点 key 过期瞬间
- 雪崩：大量 key 同时过期

**5. 大促场景**
- 10万 QPS 怎么抗住？
- 需要预热吗？
- Redis Cluster vs 代理模式？

</details>

---

<details>
<summary><strong>📝 答案</strong></summary>

### 整体架构

```
客户端（App/Web）
    ↓ 本地缓存（LRU/容量限制）
    
服务端：
  读操作 → Redis → (miss) → 数据库
  写操作 → 数据库 → (同步/异步) → Redis
```

### Key 设计

```
product:detail:{product_id}
session:{user_id}
cart:{user_id}
```

### 客户端缓存一致性

**版本号机制**：

```json
// 服务端
{"id": "p123", "version": 56, "price": 99.9}

// 客户端缓存
{"id": "p123", "version": 55, "cached_price": 98.0}
```

客户端请求 `GET /product/p123/version`，发现版本低于服务端，下拉完整数据更新本地缓存。

### 穿透/击穿/雪崩

**穿透**：缓存空值

```python
if not found:
    redis.setex(key, short_ttl, "NULL")
```

**击穿**：热点永不过期 + 互斥锁

```python
# 方案A：永不过期，异步刷新
# 方案B：互斥锁，只允许一个请求回源
```

**雪崩**：随机 TTL

```python
TTL = base_ttl + random.randint(0, 1800)
```

### Redis 集群

| 场景 | 推荐 |
|------|------|
| <50万 QPS | Redis Cluster |
| >50万 QPS / 批量操作多 | Twemproxy/Codis |

### 大促预热

```python
def preheat():
    products = get_promotion_products()  # 10万个
    for batch in chunk(products, 1000):
        data = db.batch_get(batch)
        redis.pipeline().setex(data)
        time.sleep(5)  # 控制速度
```

</details>

---

**[← 返回系统设计](../intro.md)**
