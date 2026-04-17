import{_ as n,o as a,c as t,ae as r}from"./chunks/framework.Czhw_PXq.js";const h=JSON.parse('{"title":"缓存系统设计 - 提示","description":"","frontmatter":{},"headers":[],"relativePath":"系统设计/缓存系统设计/提示.md","filePath":"系统设计/缓存系统设计/提示.md"}'),o={name:"系统设计/缓存系统设计/提示.md"};function s(_,e,d,i,p,c){return a(),t("div",null,[...e[0]||(e[0]=[r(`<h1 id="缓存系统设计-提示" tabindex="-1">缓存系统设计 - 提示 <a class="header-anchor" href="#缓存系统设计-提示" aria-label="Permalink to &quot;缓存系统设计 - 提示&quot;">​</a></h1><p>??? tip &quot;💡 应该从哪些方面考虑？&quot;</p><pre><code>**1. 缓存架构**

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
</code></pre><hr><p><a href="./">← 返回缓存系统设计</a> | <a href="./题目.html">题目 →</a> | <a href="./答案.html">答案 →</a></p>`,5)])])}const f=n(o,[["render",s]]);export{h as __pageData,f as default};
