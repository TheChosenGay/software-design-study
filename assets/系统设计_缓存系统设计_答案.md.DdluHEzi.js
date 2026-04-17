import{_ as t,o as e,c as o,ae as r}from"./chunks/framework.Czhw_PXq.js";const h=JSON.parse('{"title":"缓存系统设计 - 答案","description":"","frontmatter":{},"headers":[],"relativePath":"系统设计/缓存系统设计/答案.md","filePath":"系统设计/缓存系统设计/答案.md"}'),a={name:"系统设计/缓存系统设计/答案.md"};function s(d,n,i,p,u,c){return e(),o("div",null,[...n[0]||(n[0]=[r(`<h1 id="缓存系统设计-答案" tabindex="-1">缓存系统设计 - 答案 <a class="header-anchor" href="#缓存系统设计-答案" aria-label="Permalink to &quot;缓存系统设计 - 答案&quot;">​</a></h1><p>??? success &quot;📝 完整答案&quot;</p><pre><code>### 整体架构

\`\`\`
客户端（App/Web）
    ↓ 本地缓存（LRU/容量限制）

服务端：
  读操作 → Redis → (miss) → 数据库
  写操作 → 数据库 → (同步/异步) → Redis
\`\`\`

### Key 设计

\`\`\`
product:detail:{product_id}
session:{user_id}
cart:{user_id}
\`\`\`

### 客户端缓存一致性

**版本号机制**：

\`\`\`json
// 服务端
{&quot;id&quot;: &quot;p123&quot;, &quot;version&quot;: 56, &quot;price&quot;: 99.9}

// 客户端缓存
{&quot;id&quot;: &quot;p123&quot;, &quot;version&quot;: 55, &quot;cached_price&quot;: 98.0}
\`\`\`

客户端请求 \`GET /product/p123/version\`，发现版本低于服务端，下拉完整数据更新本地缓存。

### 穿透/击穿/雪崩

**穿透**：缓存空值

\`\`\`python
if not found:
    redis.setex(key, short_ttl, &quot;NULL&quot;)
\`\`\`

**击穿**：热点永不过期 + 互斥锁

\`\`\`python
# 方案A：永不过期，异步刷新
# 方案B：互斥锁，只允许一个请求回源
\`\`\`

**雪崩**：随机 TTL

\`\`\`python
TTL = base_ttl + random.randint(0, 1800)
\`\`\`

### Redis 集群

| 场景 | 推荐 |
|------|------|
| &lt;50万 QPS | Redis Cluster |
| &gt;50万 QPS / 批量操作多 | Twemproxy/Codis |

### 大促预热

\`\`\`python
def preheat():
    products = get_promotion_products()  # 10万个
    for batch in chunk(products, 1000):
        data = db.batch_get(batch)
        redis.pipeline().setex(data)
        time.sleep(5)  # 控制速度
\`\`\`
</code></pre><hr><p><a href="./">← 返回缓存系统设计</a> | <a href="./题目.html">题目 →</a> | <a href="./提示.html">提示 →</a></p>`,5)])])}const l=t(a,[["render",s]]);export{h as __pageData,l as default};
