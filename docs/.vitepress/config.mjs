import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '软件设计能力测试',
  description: '通过刻意练习，系统提升软件设计和架构能力',
  lang: 'zh-CN',
  cleanUrls: false,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  ignoreDeadLinks: true,

  themeConfig: {
    logo: false,
    
    nav: [
      { text: '首页', link: '/' },
      {
        text: '系统设计',
        items: [
          { text: '日志系统设计', link: '/系统设计/日志系统设计/' },
          { text: '缓存系统设计', link: '/系统设计/缓存系统设计/' }
        ]
      },
      {
        text: '存储',
        items: [
          { text: 'Redis', link: '/存储/Redis/' },
          { text: 'Kafka', link: '/存储/Kafka/' },
          { text: 'MySQL', link: '/存储/MySQL/' }
        ]
      },
      { text: '编码设计', link: '/编码设计/' },
      { text: '基础设施', link: '/基础设施/Docker-K8s/' },
      {
        text: 'AI',
        items: [
          { text: 'LLM', link: '/AI/LLM/' },
          { text: 'RAG', link: '/AI/RAG/' }
        ]
      }
    ],

    sidebar: {
      '/系统设计/日志系统设计/': [
        {
          title: '日志系统设计',
          collapsible: false,
          items: [
            { text: '题目', link: '/系统设计/日志系统设计/' },
            { text: '提示', link: '/系统设计/日志系统设计/提示' },
            { text: '答案', link: '/系统设计/日志系统设计/答案' },
            { text: '薄弱点', link: '/系统设计/日志系统设计/薄弱点' }
          ]
        }
      ],
      '/系统设计/缓存系统设计/': [
        {
          title: '缓存系统设计',
          collapsible: false,
          items: [
            { text: '题目', link: '/系统设计/缓存系统设计/' },
            { text: '提示', link: '/系统设计/缓存系统设计/提示' },
            { text: '答案', link: '/系统设计/缓存系统设计/答案' },
            { text: '薄弱点', link: '/系统设计/缓存系统设计/薄弱点' }
          ]
        }
      ],
      '/存储/Redis/': [
        {
          title: 'Redis',
          collapsible: false,
          items: [
            { text: '专题', link: '/存储/Redis/' }
          ]
        }
      ],
      '/存储/Kafka/': [
        {
          title: 'Kafka',
          collapsible: false,
          items: [
            { text: '专题', link: '/存储/Kafka/' }
          ]
        }
      ],
      '/存储/MySQL/': [
        {
          title: 'MySQL',
          collapsible: false,
          items: [
            { text: '专题', link: '/存储/MySQL/' }
          ]
        }
      ],
      '/编码设计/': [
        {
          title: '编码设计',
          collapsible: false,
          items: [
            { text: '专题', link: '/编码设计/' }
          ]
        }
      ],
      '/基础设施/Docker-K8s/': [
        {
          title: 'Docker/K8s',
          collapsible: false,
          items: [
            { text: '专题', link: '/基础设施/Docker-K8s/' }
          ]
        }
      ],
      '/AI/LLM/': [
        {
          title: 'LLM',
          collapsible: false,
          items: [
            { text: '专题', link: '/AI/LLM/' }
          ]
        }
      ],
      '/AI/RAG/': [
        {
          title: 'RAG',
          collapsible: false,
          items: [
            { text: '专题', link: '/AI/RAG/' }
          ]
        }
      ]
    }
  }
})
