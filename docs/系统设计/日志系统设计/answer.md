# 专题1：日志系统设计 — 完整答案

## 一、整体架构

```
App(SDK) → Kafka → 消费者 → ClickHouse（冷数据）
              ↓           ↓
           Redis ← ZSET（热数据）
              ↓
         查询入口(路由层)
```

---

## 二、日志格式

```json
{
  "topic": "error",
  "business": "payment",
  "user_id": "u12345",
  "level": "error",
  "module": "OrderService",
  "file": "OrderController.m",
  "line": 128,
  "msg": "order create failed",
  "timestamp": 1710000000
}
```

---

## 三、Kafka 设计

**Topic 划分**：按日志级别，分 3 个 topic（固定数量，不随业务增长）

```
log-error
log-warn
log-info
```

**消费者分组**：

```
consumer-group-error → 消费 log-error
consumer-group-warn  → 消费 log-warn
consumer-group-info  → 消费 log-info
```

每个消费者根据日志的 `business` 字段路由到不同的库表。

**可靠性**：Kafka 自身高可用，Consumer 挂了触发 Rebalance 自动恢复。

---

## 四、存储层设计（ClickHouse）

### 为什么选 ClickHouse

| 对比项 | MySQL | InfluxDB | ClickHouse |
|---|---|---|---|
| 写入吞吐量 | 低 | 中 | 高 |
| 范围查询 | 需索引，慢 | 快 | 极快 |
| 数据量支撑 | 亿级吃力 | 十亿级 | 千亿级轻松 |
| SQL 支持 | 原生 | 有限 | 完整 |

1000万/天 ≈ 3亿/月，ClickHouse 最合适。

### ClickHouse 表结构

```sql
CREATE DATABASE IF NOT EXISTS guild_log;

CREATE TABLE guild_log.log_error_payment (
    timestamp     DateTime64(3),     -- 毫秒级时间戳
    user_id       String,
    level         String,
    module        String,
    file          String,
    line          UInt32,
    msg           String,
    created_at    DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)   -- 按月分区
ORDER BY (timestamp, user_id)        -- 排序键（查询加速关键）
TTL timestamp + INTERVAL 30 DAY;    -- 错误日志保留30天
```

**关键概念解释**：

| 概念 | 说明 |
|---|---|
| MergeTree | ClickHouse 最常用的表引擎，列式存储，高速写入和范围查询 |
| PARTITION BY | 分区键，按月分区，查询时可快速定位分区，减少扫描量 |
| ORDER BY | 排序键，数据按这个顺序物理存储，是查询加速的关键（类似主键索引） |
| TTL | 数据生命周期，ERROR 保留 30 天，INFO 保留 7 天，按严重程度分层 |

---

## 五、Redis 缓存设计（热数据）

### 数据结构：ZSET（有序集合）

**为什么用 ZSET？**

查询场景是**按时间戳范围查询**，需要用 SCORE 排序和范围扫描。

```
String/Hash: 无法高效范围查询
ZSET: 时间戳作为 SCORE，支持 ZRANGEBYSCORE 按范围查询
```

### Key 设计

```
key = "log:{business}:{level}:recent"

示例：
log:payment:error:recent
log:order:warn:recent
```

### 存储结构

```
ZADD log:payment:error:recent 1710000000 "{json日志内容}"
ZADD log:payment:error:recent 1710000060 "{json日志内容}"
...
```

### 查询流程（查 10:15-10:45）

```python
start_ts = 1710000900  # 10:15
end_ts   = 1710002700  # 10:45

redis.zrangebyscore("log:payment:error:recent", start_ts, end_ts)
```

### TTL 设置（解决缓存击穿）

```python
# 日志持续写入，数据不断进入 Redis
# TTL 到期前，新数据已经写入
# 击穿窗口很小，但仍需防护

TTL = 3600 + random.randint(0, 1800)  # 1小时~1.5小时随机
```

**更可靠的做法：定时异步清理超过 2 小时的数据**

```python
def clean_expired_cache():
    key = "log:payment:error:recent"
    # 删除 2 小时前的数据
    redis.zremrangebyscore(key, 0, time.time() - 7200)
```

---

## 六、冷热数据路由

```python
def query_logs(business, level, start_time, end_time):
    now = time.time()
    key = f"log:{business}:{level}:recent"
    
    # 情况1：全是热数据（1小时内）
    if start_time >= now - 3600:
        return redis.zrangebyscore(key, start_time, end_time)
    
    # 情况2：全是冷数据（1小时外）
    if end_time < now - 3600:
        return clickhouse.query(business, level, start_time, end_time)
    
    # 情况3：跨冷热（最近1.5小时）
    # 1小时内查Redis，1小时外查ClickHouse，合并后按时间排序
    hot = redis.zrangebyscore(key, start_time, now - 3600)
    cold = clickhouse.query(business, level, now - 3600, end_time)
    return merge_and_sort(hot, cold)
```

---

## 七、双写一致性

**结论**：Redis 和 ClickHouse 双写无法保证强一致性，只能做到**最终一致**。

### 问题分析

```
时序1: 写 Redis 成功
时序2: 写 ClickHouse 成功
→ 一致 ✓

时序1: 写 Redis 成功
时序2: ClickHouse 写入失败
→ Redis 有数据，ClickHouse 没有
→ 不一致 ✗
```

### 方案A：补偿模式（最终一致）

```python
def write_log(log):
    redis_failed = False
    clickhouse_failed = False
    
    try:
        redis.zadd(key, {json.dumps(log): log['timestamp']})
    except Exception:
        redis_failed = True
    
    try:
        clickhouse.insert(log)
    except Exception:
        clickhouse_failed = True
    
    # 两个都失败
    if redis_failed and clickhouse_failed:
        dlq.push({'message': message, 'reason': 'both_failed'})
        alert.send("CRITICAL: 日志双写失败")
        return
    
    # 一个失败，记录补偿
    if redis_failed:
        compensate_queue.push({'target': 'redis', 'log': log})
    if clickhouse_failed:
        compensate_queue.push({'target': 'clickhouse', 'log': log})
```

**补偿队列处理**：

```python
def process_compensate_queue():
    while True:
        item = compensate_queue.pop()
        if not item:
            time.sleep(60)
            continue
        
        try:
            if item['target'] == 'clickhouse':
                clickhouse.insert(item['log'])
            else:
                redis.zadd(key, {json.dumps(item['log']): item['log']['timestamp']})
        except Exception:
            compensate_queue.push(item)  # 仍失败，放回队列
```

### 方案B：Canal 同步（推荐）

```
App → ClickHouse（唯一数据源）
            ↓
       Canal（监听 binlog）
            ↓
         Redis（缓存，由 Canal 同步更新）
```

**优点**：数据一致性完全由 ClickHouse 保证，Redis 是缓存层可以随时重建。

**缺点**：引入额外组件，Redis 数据可能有秒级延迟。

### 方案C：Kafka Buffer

你原有的架构，改进后的双写一致性设计：

```python
def consume_and_write(message):
    log = json.loads(message)
    
    try:
        redis.zadd(key, {json.dumps(log): log['timestamp']})
        clickhouse.insert(log)
    except Exception:
        # 任意一个失败，记录差异
        diff_queue.push({'log': log, 'failed_target': ...})
        # 降级：保证至少一个成功
```

---

## 八、完整数据流

```
1. App 调用 SDK 写日志
   SDK 写入内存 buffer（不阻塞主线程）

2. SDK 后台线程批量上报到 Kafka
   批量发送，减少网络开销

3. Kafka 消费者消费消息
   根据 business + level 路由

4. 消费者双写（或 Canal 同步）
   - 写入 Redis ZSET（热数据，TTL 1.5小时）
   - 写入 ClickHouse（冷数据，永久存储）

5. 查询时：
   - 根据时间范围路由到 Redis 或 ClickHouse
   - 或两者都查再合并，按时间排序
```

---

## 九、你的薄弱点

| 薄弱点 | 涉及内容 |
|---|---|
| 存储层细节 | 时序数据库选型、表结构设计、索引设计、生命周期管理 |
| 缓存数据结构 | Redis ZSET 适用场景、SCORE 排序、范围查询命令 |
| 查询路由逻辑 | 冷热数据判断、跨冷热查询合并、排序处理 |
| 双写一致性 | 强一致 vs 最终一致、补偿机制、DLQ |
| 缓存问题 | 穿透、击穿的场景化解决方案 |
| 运维监控 | Consumer lag、告警、故障检测 |
