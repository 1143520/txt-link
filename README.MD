在项目https://github.com/bestK/anynote 的基础上进行汉化修改

# 效果如下
![dd](https://jsd.1143520.xyz/gh/manji1143/picx-images-hosting@master/paste/picx-image.5mnwblqyex.avif)

![ff](https://jsd.1143520.xyz/gh/manji1143/picx-images-hosting@master/paste/picx-image.4xumrl8pc3.png)

![hh](https://jsd.1143520.xyz/gh/manji1143/picx-images-hosting@master/paste/picx-image.77dnb2v6gf.avif)

已知bug:

1、gist代码编辑器使用的vue组件
https://cdn.jsdelivr.net/gh/justcaliturner/simple-code-editor@master/browser/deps/vue@3.3.4.min.js
对于某些js代码会强行渲染，暂时没有排查出是哪些转义被遗漏了

2、KV数据同步有明显延迟

访问 https://yourdomain/list?passwd=开头设置的LIST_PASSWD
可以查看所有文件
![ee](https://jsd.1143520.xyz/gh/manji1143/picx-images-hosting@master/paste/picx-image.6pnlmi8p7z.avif)