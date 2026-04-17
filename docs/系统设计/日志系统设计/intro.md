# 日志系统设计

## 题目

**场景**
- 收集客户端 App 操作日志
- 日活 1000万条/天
- N 个业务线共用系统
- 需要按时间范围查询

**请设计：**
1. 日志采集和上报方案
2. 日志存储方案
3. 日志查询展示方案

**评估维度：**
- 可扩展性
- 可靠性
- 性能
- 成本

---

<details>
<summary><strong>💡 提示：应该从哪些方面考虑？</strong></summary>

**1. 日志采集和上报**
- SDK 如何设计？（内存缓冲、异步推送）
- 网络传输用什么协议？（MQTT？HTTP？）
- 服务端如何接收？（Kafka？直接落库？）

**2. 日志存储**
- 时序数据库 vs MySQL vs 其他？
- 表结构怎么设计？
- 索引怎么建？
- 数据生命周期怎么管？

**3. 日志查询**
- 冷热数据怎么分离？
- 热数据用什么缓存？
- 查询入口怎么路由？

**4. 高并发场景**
- 10万/秒写入怎么抗住？
- 需要集群吗？
- 消费者怎么设计？

</details>

---

<details>
<summary><strong>📝 答案</strong></summary>

### 整体架构

```
App(SDK) → Kafka → 消费者 → ClickHouse（冷数据）
              ↓           ↓
           Redis ← ZSET（热数据）
              ↓
         查询入口(路由层)
```

### 日志格式

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

### Kafka 设计

**Topic 划分**：按日志级别，分 3 个 topic

```
log-error
log-warn
log-info
```

消费者根据日志的 `business` 字段路由到不同的库表。

### ClickHouse 表结构

```sql
CREATE TABLE guild_log.log_error_payment (
    timestamp     DateTime64(3),
    user_id       String,
    level         String,
    module        String,
    file          String,
    line          UInt32,
    msg           String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, user_id)
TTL timestamp + INTERVAL 30 DAY;
```

### Redis ZSET 热数据

```python
# Key: log:{business}:{level}:recent
# 存疑问题：TTL设多长？
# 答案：1小时~1.5小时随机，防止雪崩

TTL = 3600 + random.randint(0, 1800)
redis.zadd("log:payment:error:recent", {json: ts})
```

### 冷热数据路由

```python
if 查询时间范围.end < now - 1小时:
    # 全是冷数据，查ClickHouse
elif 查询时间范围.start >= now - 1小时:
    # 全是热数据，查Redis
else:
    # 跨冷热，两者都查再合并
```

### 双写一致性

Redis 和 ClickHouse 无法保证强一致，只能最终一致：

- 失败时记录补偿队列
- 两个都失败则入DLQ报警

</details>

---

**[← 返回系统设计](../intro.md)**
