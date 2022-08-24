import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Common',
  themeConfig: {
    sidebar: [
      {
        text: "Elements",
        link: "./elements/",
        children: [
          { text: "Boxes", link: "./elements/box"}
        ]
      },
      {
        text: "Components",
        link: "./components/",
        children: [
          { text: "Fields", link: "./components/field"},
          { text: "Panels", link: "./components/panel"}
        ]
      }
    ]
  }
})
