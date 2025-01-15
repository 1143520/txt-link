LIST_PASSWD = 'defaultpassword';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept',
};
async function handleRequest(request) {
    url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '') {
        const html = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>任意笔记</title>
            <link rel="icon" type="image/png" href="https://cdn.h5wan.4399sj.com/public/images/report/20250115/80500252_10827400.png">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #0d1117;
                    color: #c9d1d9;
                }
                h1 {
                    color: #58a6ff;
                }
                .form-container {
                    position: relative;
                    margin: 20px 0;
                }
                textarea {
                    width: 100%;
                    height: 400px;
                    margin: 10px 0;
                    padding: 10px;
                    background: #161b22;
                    border: 1px solid #969096;  /* 加粗白色边框 */
                    border-radius: 6px;
                    color: #c9d1d9;
                    font-family: monospace;
                    font-size: 18px;
                    line-height: 1.4;
                    resize: vertical;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }
                textarea:focus {
                    outline: none;
                    border-color: #307825;
                    box-shadow: 0 0 0 2px rgba(48, 120, 37, 0.2);
                }
                .button-container {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 10px;
                }
                button {
                    background: #238636;
                    color: #ffffff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.2s;
                }
                button:hover {
                    background: #2ea043;
                }
                #result {
                    display: none;
                    margin-top: 20px;
                    padding: 15px;
                    background: #161b22;
                    border: 1px solid #30363d;
                    border-radius: 6px;
                }
                /* 添加全局链接样式 */
                a {
                    color: #58a6ff;  /* GitHub风格的蓝色链接 */
                    text-decoration: none;
                    transition: color 0.2s;
                }
                
                a:hover {
                    text-decoration: underline;
                    color: #79c0ff;  /* 悬停时颜色变亮 */
                }
                
                #result a {
                    margin-right: 15px;  /* 结果区域的链接间距 */
                }
                /* 自定义滚动条样式 */
                textarea::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                    background: #0d1117;
                }
                
                textarea::-webkit-scrollbar-thumb {
                    background: #30363d;
                    border-radius: 4px;
                }
                
                textarea::-webkit-scrollbar-thumb:hover {
                    background: #3f4651;
                }
                
                textarea::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                /* Firefox滚动条样式 */
                textarea {
                    scrollbar-width: thin;
                    scrollbar-color: #30363d #0d1117;
                }
                .title-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .logo {
                    width: 64px;
                    height: 64px;
                }
                
                h1 {
                    margin: 0;
                    color: #58a6ff;
                }
            </style>
        </head>
        <body>
            <div class="title-container">
                <img src="https://cdn.h5wan.4399sj.com/public/images/report/20250115/80500252_10827400.png" alt="logo" class="logo">
                <h1>任意笔记</h1>
            </div>
            <p>这是一个部署在Cloudflare Workers的文本处理和分享项目。</p>
            <div class="form-container">
                <textarea id="content" placeholder="输入你的内容..."></textarea>
                <div class="button-container">
                    <button onclick="submit()">提交处理</button>
                </div>
            </div>
            <div id="result"></div>
            <script>
                async function submit() {
                    const content = document.getElementById('content').value;
                    if (!content) return;
                    
                    const key = Math.random().toString(36).substring(2, 8);
                    const response = await fetch('/set', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            key: key,
                            value: content
                        })
                    });
                    
                    const result = await response.text();
                    const resultDiv = document.getElementById('result');
                    resultDiv.style.display = 'block';  // 显示结果框
                    resultDiv.innerHTML = result;
                }

                // 页面加载时隐藏结果框
                document.getElementById('result').style.display = 'none';
            </script>
        </body>
        </html>`;

        return new Response(html, {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            },
        });
    }

    if (url.pathname === '/set') {
        const { key, value } = await readRequestBody(request);
        await NOTE.put(key, value);
        let res =
            `原始内容: <a href = "/${key}" target="_blank">/${key}</a>` +
            `<br/>Html: <a href = "/${key}.html" target="_blank">/${key}.html</a>` +
            `<br/>Markdown: <a href = "/${key}.md" target="_blank">/${key}.md</a>` +
            `<br/>Gist: <a href = "/${key}.gist" target="_blank">/${key}.gist</a>`;
        return new Response(res, { headers: corsHeaders });
    }

    if (url.pathname === '/list') {
        const value = await NOTE.list();
        passwd = url.searchParams.get('passwd');
        if (passwd !== LIST_PASSWD) {
            return new Response('密码不正确', { status: 400 });
        }
        
        // 获取所有内容及其第一行
        const notes = await Promise.all(value.keys.map(async key => {
            const content = await NOTE.get(key.name);
            const firstLine = content.split('\n')[0].substring(0, 50); // 限制长度为50个字符
            return {
                key: key.name,
                title: firstLine || '(无标题)' // 如果第一行为空则显示"无标题"
            };
        }));

        const html = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>内容列表</title>
            <link rel="icon" type="image/png" href="https://cdn.h5wan.4399sj.com/public/images/report/20250115/80500252_10827400.png">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #0d1117;
                    color: #c9d1d9;
                }
                h1 {
                    color: #58a6ff;
                }
                .note-list {
                    list-style: none;
                    padding: 0;
                }
                .note-item {
                    background: #161b22;
                    border: 1px solid #30363d;
                    border-radius: 6px;
                    margin: 10px 0;
                    padding: 15px;
                }
                .note-title {
                    font-size: 16px;
                    margin-bottom: 10px;
                    color: #e6edf3;
                }
                .note-key {
                    font-size: 12px;
                    color: #8b949e;
                    margin-bottom: 10px;
                }
                .note-links a {
                    color: #58a6ff;
                    text-decoration: none;
                    margin-right: 15px;
                    font-size: 14px;
                }
                .note-links a:hover {
                    text-decoration: underline;
                }
                .clear-button {
                    background: #d73a49;  /* 红色按钮 */
                    color: #ffffff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.2s;
                    margin-bottom: 20px;
                }
                
                .clear-button:hover {
                    background: #cb2431;
                }
            </style>
        </head>
        <body>
            <h1>内容列表</h1>
            <button class="clear-button" onclick="clearAll()">清空所有内容</button>
            <ul class="note-list">
                ${notes.map(note => `
                    <li class="note-item">
                        <div class="note-title">${note.title}</div>
                        <div class="note-key">ID: ${note.key}</div>
                        <div class="note-links">
                            <a href="/${note.key}" target="_blank">SOURCE</a>
                            <a href="/${note.key}.html" target="_blank">HTML</a>
                            <a href="/${note.key}.md" target="_blank">MARKDOWN</a>
                            <a href="/${note.key}.gist" target="_blank">GIST</a>
                        </div>
                    </li>
                `).join('')}
            </ul>
            
            <script>
                async function clearAll() {
                    if (!confirm('确定要清空所有内容吗？此操作不可恢复！')) {
                        return;
                    }
                    
                    try {
                        const response = await fetch('/clear?passwd=${LIST_PASSWD}', {
                            method: 'POST'
                        });
                        
                        if (response.ok) {
                            alert('清空成功！');
                            document.querySelector('.note-list').innerHTML = '';
                        } else {
                            alert('清空失败：' + await response.text());
                        }
                    } catch (err) {
                        alert('操作失败：' + err.message);
                    }
                }
            </script>
        </body>
        </html>`;

        return new Response(html, {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            },
        });
    }

    if (url.pathname === '/clear') {
        passwd = url.searchParams.get('passwd');
        if (passwd !== LIST_PASSWD) {
            return new Response('密码不正确', { status: 400 });
        }
        
        const value = await NOTE.list();
        // 删除所有内容，但排除 list 路径
        await Promise.all(value.keys
            .filter(key => key.name !== 'list')  // 过滤掉 list 路径
            .map(key => NOTE.delete(key.name))
        );
        
        return new Response('清空成功', { headers: corsHeaders });
    }

    if (url.pathname !== '') {
        key = url.pathname.split('/')[1];
        const isHtml = key.endsWith('.html');
        const isMD = key.endsWith('.md');
        const isGist = key.endsWith('.gist');
        if (isHtml || isMD || isGist) {
            key = key.split('.')[0];
        }
        const value = await NOTE.get(key);

        const { cf } = request;

        // 检查 IP 是否来自中国
        const isChina = cf && cf.country === 'CN';
        const jsdelivrHost = isChina
            ? 'jsd.onmicrosoft.cn'
            : 'cdn.jsdelivr.net';

        if (isHtml) {
            const html = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <link rel="icon" type="image/png" href="https://cdn.h5wan.4399sj.com/public/images/report/20250115/80500252_10827400.png">
                <style>
                    :root {
                        color-scheme: light dark;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: #0d1117;
                        color: #c9d1d9;
                        line-height: 1.6;
                    }
                    a {
                        color: #58a6ff;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    pre {
                        position: relative;
                        background: #161b22;
                        border: 1px solid #30363d;
                        border-radius: 6px;
                        padding: 0;
                        margin: 16px 0;
                        overflow: hidden;
                    }
                    pre code {
                        display: block;
                        padding: 16px;
                        overflow-x: auto;
                        font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
                        font-size: 14px;
                        line-height: 1.45;
                        color: #e6edf3;
                        background: transparent;
                        border: 0;
                        margin: 0;
                        white-space: pre;
                        word-break: normal;
                        word-wrap: normal;
                        tab-size: 2;
                    }
                    p code {
                        background: rgba(110,118,129,0.4);
                        padding: 0.2em 0.4em;
                        border-radius: 6px;
                        font-size: 85%;
                    }
                    .hljs {
                        display: block;
                        overflow-x: auto;
                        padding: 1em;
                        color: #e6edf3;
                        background: transparent;
                    }
                    pre::-webkit-scrollbar {
                        height: 8px;
                        background: #0d1117;
                    }
                    pre::-webkit-scrollbar-thumb {
                        background: #30363d;
                        border-radius: 4px;
                    }
                    pre::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    /* 复制按钮样式 */
                    .copy-button {
                        position: absolute;
                        right: 8px;
                        top: 8px;
                        background: #238636;
                        border: 1px solid rgba(240,246,252,0.1);
                        border-radius: 6px;
                        color: #fff;
                        padding: 5px 10px;
                        font-size: 12px;
                        cursor: pointer;
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    .copy-button:hover {
                        background: #2ea043;
                    }
                    .copy-button.copied {
                        background: #388bfd;
                    }
                    pre:hover .copy-button {
                        opacity: 1;
                    }
                </style>
                <link rel="stylesheet" href="https://${jsdelivrHost}/npm/highlight.js/styles/github-dark.css">
                <script src="https://${jsdelivrHost}/npm/highlight.js/highlight.min.js"></script>
            </head>
            <body>
                ${value}
                <script>
                    document.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightBlock(block);
                        
                        // 为每个代码块添加复制按钮
                        const pre = block.parentElement;
                        const button = document.createElement('button');
                        button.className = 'copy-button';
                        button.textContent = '复制';
                        
                        button.addEventListener('click', async () => {
                            try {
                                await navigator.clipboard.writeText(block.textContent);
                                button.textContent = '已复制!';
                                button.classList.add('copied');
                                setTimeout(() => {
                                    button.textContent = '复制';
                                    button.classList.remove('copied');
                                }, 2000);
                            } catch (err) {
                                button.textContent = '复制失败!';
                                setTimeout(() => {
                                    button.textContent = '复制';
                                }, 2000);
                            }
                        });
                        
                        pre.appendChild(button);
                    });
                </script>
            </body>
            </html>`;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                },
            });
        } else if (isMD) {
            const escapedValue = value.replace(/`/g, '\\`').replace(/\$/g, '\\$');
            const html = `<!doctype html>
                        <html>
                        <head>
                          <meta charset="utf-8"/>
                          <title>Markdown Preview</title>
                          <link rel="icon" type="image/png" href="https://cdn.h5wan.4399sj.com/public/images/report/20250115/80500252_10827400.png">
                          <link rel="stylesheet" href="https://${jsdelivrHost}/npm/github-markdown-css/github-markdown.css">
                          <link rel="stylesheet" href="https://${jsdelivrHost}/npm/highlight.js/styles/github-dark.css">
                          <style>
                            :root {
                              color-scheme: light dark;
                            }
                            body {
                              background-color: #0d1117;
                              color: #c9d1d9;
                            }
                            .markdown-body {
                              box-sizing: border-box;
                              min-width: 200px;
                              max-width: 980px;
                              margin: 0 auto;
                              padding: 45px;
                              background-color: #0d1117;
                              color: #c9d1d9;
                            }
                            @media (max-width: 767px) {
                              .markdown-body {
                                padding: 15px;
                              }
                            }
                            .markdown-body pre {
                              background-color: #161b22 !important;
                              border: 1px solid #30363d;
                              padding: 16px;
                              margin-bottom: 16px;
                            }
                            .markdown-body pre code {
                              background-color: transparent !important;
                              border: 0;
                              display: block;
                              line-height: 1.45;
                              margin: 0;
                              overflow: auto;
                              padding: 0;
                              font-size: 14px;
                              white-space: pre;
                              word-break: normal;
                              word-wrap: normal;
                            }
                            .markdown-body code {
                              background-color: rgba(110,118,129,0.4) !important;
                              border-radius: 6px;
                              font-size: 14px;
                              margin: 0;
                              padding: 0.2em 0.4em;
                            }
                            .markdown-body img {
                              background-color: transparent;
                            }
                            .markdown-body blockquote {
                              color: #8b949e;
                              border-left: 0.25em solid #3b434b;
                            }
                            .markdown-body hr {
                              background-color: #30363d;
                            }
                            .markdown-body table tr {
                              background-color: #0d1117;
                              border-top: 1px solid #30363d;
                            }
                            .markdown-body table tr:nth-child(2n) {
                              background-color: #161b22;
                            }
                            .markdown-body table th,
                            .markdown-body table td {
                              border: 1px solid #30363d;
                            }
                            .copy-button {
                              position: absolute;
                              right: 8px;
                              top: 8px;
                              background: #2ea44f;
                              border: 1px solid rgba(240,246,252,0.1);
                              border-radius: 6px;
                              color: #fff;
                              padding: 5px 10px;
                              font-size: 12px;
                              cursor: pointer;
                              opacity: 0;
                              transition: opacity 0.3s;
                            }
                            .copy-button:hover {
                              background: #2c974b;
                            }
                            .copy-button.copied {
                              background: #388bfd;
                            }
                            pre {
                              position: relative;
                            }
                            pre:hover .copy-button {
                              opacity: 1;
                            }
                          </style>
                        </head>
                        <body class="markdown-body">
                          <div id="content"></div>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/highlight.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/javascript.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/typescript.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/python.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/java.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/go.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/rust.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/json.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/yaml.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/bash.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/shell.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/sql.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/xml.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/css.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/highlight.js/languages/markdown.min.js"></script>
                          <script src="https://${jsdelivrHost}/npm/marked/marked.min.js"></script>
                          <script>
                            hljs.configure({
                              ignoreUnescapedHTML: true
                            });
                            marked.setOptions({
                              highlight: function(code, language) {
                                if (language && hljs.getLanguage(language)) {
                                  try {
                                    return hljs.highlight(code, { language }).value;
                                  } catch (err) {}
                                }
                                return code;
                              },
                              breaks: true,
                              gfm: true
                            });
                            document.getElementById('content').innerHTML =
                              marked.parse(\`${escapedValue}\`);
                            
                            // 添加复制按钮到每个代码块
                            document.querySelectorAll('pre code').forEach((block) => {
                              hljs.highlightBlock(block);
                              
                              const pre = block.parentElement;
                              const button = document.createElement('button');
                              button.className = 'copy-button';
                              button.textContent = 'Copy';
                              
                              button.addEventListener('click', async () => {
                                try {
                                  await navigator.clipboard.writeText(block.textContent);
                                  button.textContent = 'Copied!';
                                  button.classList.add('copied');
                                  setTimeout(() => {
                                    button.textContent = 'Copy';
                                    button.classList.remove('copied');
                                  }, 2000);
                                } catch (err) {
                                  button.textContent = 'Failed!';
                                  setTimeout(() => {
                                    button.textContent = 'Copy';
                                  }, 2000);
                                }
                              });
                              
                              pre.appendChild(button);
                            });
                          </script>
                        </body>
                        </html>`;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                },
            });
        } else if (isGist) {
            const escapedValue = value.replace(/`/g, '\\`').replace(/\$/g, '\\$');
            const html = `
            <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Code Editor</title>
                    <link rel="icon" type="image/png" href="https://cdn.h5wan.4399sj.com/public/images/report/20250115/80500252_10827400.png">
                    <!-- css -->
                    <link rel="stylesheet" href="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/css/simple-code-editor.css" />
                    <link rel="stylesheet" href="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/css/themes/themes-base16.css" />
                    <link rel="stylesheet" href="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/css/themes/themes.css" />
                    <style>
                      :root {
                        color-scheme: dark;
                      }
                      body {
                        margin: 0;
                        background-color: #0d1117;
                      }
                      ::-webkit-scrollbar {
                        width: 0;
                        height: 0;
                      }
                      #app {
                        background-color: #0d1117;
                      }
                      .simple-code-editor {
                        background-color: #0d1117 !important;
                        color: #c9d1d9 !important;
                      }
                      .simple-code-editor__textarea {
                        background-color: #0d1117 !important;
                        color: #c9d1d9 !important;
                      }
                      .simple-code-editor__line-numbers {
                        background-color: #161b22 !important;
                        border-right: 1px solid #30363d !important;
                        color: #6e7681 !important;
                      }
                      .simple-code-editor__highlight {
                        background-color: #0d1117 !important;
                      }
                      .hljs {
                        background-color: #0d1117 !important;
                        color: #c9d1d9 !important;
                      }
                      .hljs-keyword { color: #ff7b72 !important; }
                      .hljs-string { color: #a5d6ff !important; }
                      .hljs-number { color: #79c0ff !important; }
                      .hljs-function { color: #d2a8ff !important; }
                      .hljs-title { color: #d2a8ff !important; }
                      .hljs-params { color: #c9d1d9 !important; }
                      .hljs-comment { color: #8b949e !important; }
                    </style>
                </head>

                <body>
                    <div id="app">
                    <code-editor
                        style="overflow: hidden; margin:0 auto"
                        theme="github-dark"
                        :line-nums="true"
                        v-model="value"
                        width="100vh" 
                        height="100vh"
                        :languages="[['javascript', 'JS'], ['html', 'HTML'],['python', 'Python'],['css', 'CSS'],['java', 'Java'],['json', 'JSON'],['typescript', 'TS'],['markdown', 'MD'],['yaml', 'YAML'],['sql', 'SQL']]"
                    ></code-editor>
                    </div>
                    <!-- js -->
                    <script src="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/deps/vue@3.3.4.min.js"></script>
                    <script src="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/deps/highlight.min.js"></script>
                    <script src="https://${jsdelivrHost}/gh/justcaliturner/simple-code-editor@master/browser/js/simple-code-editor.js"></script>
                    
                    <script>
                    const app = Vue.createApp({
                        components: {
                        "code-editor": CodeEditor,
                        },
                        data() {
                        return {
                            value: \`${escapedValue}\`,
                        };
                        },
                    });
                    app.mount("#app");
                    </script>
                </body>
                </html>
            
            `;
            return new Response(html, {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                },
            });
        }

        return new Response(value);
    }
    else {
        return fetch(static_ui);
    }
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
    const { headers } = request;
    const contentType = headers.get('content-type') || '';
    console.log(JSON.stringify(request), 'request');
    if (contentType.includes('application/json')) {
        return await request.json();
    } else if (contentType.includes('application/text')) {
        return request.text();
    } else if (contentType.includes('text/html')) {
        return request.text();
    } else if (contentType.includes('form')) {
        const formData = await request.formData();
        const body = {};
        for (const entry of formData.entries()) {
            body[entry[0]] = entry[1];
        }
        return JSON.stringify(body);
    } else {
        // Perhaps some other type of data was submitted in the form
        // like an image, or some other binary data.
        return 'a file';
    }
}