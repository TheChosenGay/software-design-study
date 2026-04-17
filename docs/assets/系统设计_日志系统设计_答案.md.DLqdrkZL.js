import{_ as e,o as t,c as o,ae as r}from"./chunks/framework.Czhw_PXq.js";const p=JSON.parse('{"title":"日志系统设计 - 答案","description":"","frontmatter":{},"headers":[],"relativePath":"系统设计/日志系统设计/答案.md","filePath":"系统设计/日志系统设计/答案.md"}'),a={name:"系统设计/日志系统设计/答案.md"};function u(s,n,i,l,q,d){return t(),o("div",null,[...n[0]||(n[0]=[r(`<h1 id="日志系统设计-答案" tabindex="-1">日志系统设计 - 答案 <a class="header-anchor" href="#日志系统设计-答案" aria-label="Permalink to &quot;日志系统设计 - 答案&quot;">​</a></h1><p>??? success &quot;📝 完整答案&quot;</p><pre><code>### 整体架构

\`\`\`
App(SDK) → Kafka → 消费者 → ClickHouse（冷数据）
              ↓           ↓
           Redis ← ZSET（热数据）
              ↓
         查询入口(路由层)
\`\`\`

### 日志格式

\`\`\`json
{
  &quot;topic&quot;: &quot;error&quot;,
  &quot;business&quot;: &quot;payment&quot;,
  &quot;user_id&quot;: &quot;u12345&quot;,
  &quot;level&quot;: &quot;error&quot;,
  &quot;module&quot;: &quot;OrderService&quot;,
  &quot;file&quot;: &quot;OrderController.m&quot;,
  &quot;line&quot;: 128,
  &quot;msg&quot;: &quot;order create failed&quot;,
  &quot;timestamp&quot;: 1710000000
}
\`\`\`

### Kafka 设计

**Topic 划分**：按日志级别，分 3 个 topic

- \`log-error\`
- \`log-warn\`
- \`log-info\`

消费者根据日志的 \`business\` 字段路由到不同的库表。

### ClickHouse 表结构

\`\`\`sql
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
\`\`\`

### Redis ZSET 热数据

\`\`\`python
# Key: log:{business}:{level}:recent
# TTL: 1小时~1.5小时随机，防止雪崩

TTL = 3600 + random.randint(0, 1800)
redis.zadd(&quot;log:payment:error:recent&quot;, {json: ts})
\`\`\`

### 冷热数据路由

\`\`\`python
if 查询时间范围.end &lt; now - 1小时:
    # 全是冷数据，查ClickHouse
elif 查询时间范围.start &gt;= now - 1小时:
    # 全是热数据，查Redis
else:
    # 跨冷热，两者都查再合并
\`\`\`

### 双写一致性

Redis 和 ClickHouse 无法保证强一致，只能最终一致：

- 失败时记录补偿队列
- 两个都失败则入DLQ报警
</code></pre><hr><p><a href="./">← 返回日志系统设计</a> | <a href="./题目.html">题目 →</a> | <a href="./提示.html">提示 →</a></p>`,5)])])}const c=e(a,[["render",u]]);export{p as __pageData,c as default};
