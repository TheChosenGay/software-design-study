import{_ as e,o as a,c as t,ae as r}from"./chunks/framework.Czhw_PXq.js";const f=JSON.parse('{"title":"日志系统设计 - 提示","description":"","frontmatter":{},"headers":[],"relativePath":"系统设计/日志系统设计/提示.md","filePath":"系统设计/日志系统设计/提示.md"}'),o={name:"系统设计/日志系统设计/提示.md"};function _(s,n,p,c,d,i){return a(),t("div",null,[...n[0]||(n[0]=[r(`<h1 id="日志系统设计-提示" tabindex="-1">日志系统设计 - 提示 <a class="header-anchor" href="#日志系统设计-提示" aria-label="Permalink to &quot;日志系统设计 - 提示&quot;">​</a></h1><p>??? tip &quot;💡 应该从哪些方面考虑？&quot;</p><pre><code>**1. 日志采集和上报**

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
</code></pre><hr><p><a href="./">← 返回日志系统设计</a> | <a href="./题目.html">题目 →</a> | <a href="./答案.html">答案 →</a></p>`,5)])])}const h=e(o,[["render",_]]);export{f as __pageData,h as default};
