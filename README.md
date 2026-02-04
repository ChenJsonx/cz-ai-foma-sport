# AI FOMA Sport 自动打卡脚本

在浏览器 console 中执行的运动打卡脚本，提供两个独立函数可按需调用。

## 更新日志

### v2.0.0 (2026-02-04)
- **架构重构**：从定时调度模式改为两个独立的立即执行函数
- **新增功能**：
  - 防重复执行机制（同一函数执行中不可重复调用）
  - Token 过期自动检测（401 响应时提示更新）
  - 安全 JSON 解析（防止解析错误导致脚本崩溃）
- **修复**：时间间隔计算逻辑修正

### v1.0.0
- 初始版本，定时自动执行模式

## 功能

- `courseScoreFetcher()` - 课程成绩获取函数，自动提交 18 个课程成绩（课程 ID 92-109）
- `exerciseSubmitter()` - 运动数据提交函数，自动提交 8 项运动数据
- 防重复执行保护
- Token 过期自动检测
- 随机间隔时间，模拟真实操作

## 使用方法

1. 通过某办公软件获取自己的 token（抓包或复制链接等方式）
2. 打开浏览器开发者工具 (F12)
3. 从 Network 请求中获取你的 Authorization token（格式：`Bearer xxx...`）
4. 将 `index.js` 第 3 行的 `TOKEN` 变量填入你的 token
5. 复制整个脚本内容到 Console 中执行
6. 调用需要的函数：
   - `courseScoreFetcher()` - 执行课程成绩提交
   - `exerciseSubmitter()` - 执行运动数据提交

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| 课程间隔 | 每个课程之间的等待时间 | 1分30秒 - 2分45秒 |
| 运动间隔 | 每项运动之间的等待时间 | 8分20秒 - 11分50秒 |

## 运动项目配置

| 运动 | 次数范围 | 时长范围(秒) |
|------|----------|--------------|
| 跳绳 | 100-168 | 92-156 |
| 卷腹 | 20-47 | 38-86 |
| 高抬腿 | 100-157 | 78-134 |
| 俯卧撑 | 20-41 | 54-97 |
| 开合跳 | 30-67 | 41-79 |
| 深蹲 | 30-53 | 58-96 |
| 仰卧起坐 | 30-52 | 61-99 |
| 平板支撑 | - | 124-187 |

## 免责声明

1. **本项目仅供学习和研究使用**，旨在帮助开发者了解浏览器自动化脚本的编写方式。
2. **使用者需自行承担使用本脚本的所有风险和责任**，包括但不限于：
   - 违反相关平台服务条款导致的账号封禁
   - 因数据造假导致的学业处分
   - 其他任何直接或间接损失
3. **作者不对以下情况承担任何责任**：
   - 使用本脚本造成的任何后果
   - 脚本运行错误或失败导致的问题
   - 第三方平台政策变更导致的兼容性问题
4. **使用本脚本即表示您已阅读并同意本免责声明**。如不同意，请立即删除本项目。
5. 本项目不鼓励、不支持任何形式的学术不端行为。请在遵守学校规定的前提下合理使用。

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
