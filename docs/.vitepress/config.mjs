import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '软件设计能力',
  description: '通过刻意练习，系统提升软件设计和架构能力',
  lang: 'zh-CN',
  base: '/software-design-study/',
  cleanUrls: false,

  head: [
    ['link', { rel: 'icon', href: '/software-design-study/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }]
  ],

  ignoreDeadLinks: true,

  themeConfig: {
    logo: { src: '/favicon.ico', width: 24, height: 24 },
    siteTitle: '软件设计能力',

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
          text: '日志系统设计',
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
          text: '缓存系统设计',
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
          text: 'Redis',
          items: [
            { text: '专题概览', link: '/存储/Redis/' }
          ]
        }
      ],
      '/存储/Kafka/': [
        {
          text: 'Kafka',
          items: [
            { text: '专题概览', link: '/存储/Kafka/' }
          ]
        }
      ],
      '/存储/MySQL/': [
        {
          text: 'MySQL',
          items: [
            { text: '专题概览', link: '/存储/MySQL/' }
          ]
        }
      ],
      '/编码设计/': [
        {
          text: '编码设计',
          items: [
            { text: '专题概览', link: '/编码设计/' },
            { text: '代码抽象', link: '/编码设计/代码抽象' },
            { text: '依赖管理', link: '/编码设计/依赖管理' }
          ]
        }
      ],
      '/基础设施/Docker-K8s/': [
        {
          text: '基础设施',
          items: [
            { text: 'Docker / K8s', link: '/基础设施/Docker-K8s/' }
          ]
        }
      ],
      '/AI/LLM/': [
        {
          text: 'AI',
          items: [
            { text: 'LLM', link: '/AI/LLM/' },
            { text: 'RAG', link: '/AI/RAG/' }
          ]
        }
      ],
      '/AI/RAG/': [
        {
          text: 'AI',
          items: [
            { text: 'LLM', link: '/AI/LLM/' },
            { text: 'RAG', link: '/AI/RAG/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheChosenGay/software-design-study' }
    ],

    footer: {
      message: '刻意练习，持续精进',
      copyright: 'Copyright © 2025'
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '本页目录',
      level: [2, 3]
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short'
      }
    }
  }
})
