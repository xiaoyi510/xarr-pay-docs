# 使用 Docker 安装系统


### docker-compose.yml 文件内容
```
version: '3.8'
services:
  xarr-pay-merchant:
    container_name: xarr-pay-merchant
    image: xiaoyi510/xarr-pay-merchant
    environment:
      - TZ=Asia/Shanghai
    ports:
      - "32000:32000"
    volumes:
      - ./plugins:/app/plugins
      - ./config:/app/config
      - ./runtime:/app/runtime
    entrypoint: /app/xarr-pay-merchant
    restart: always
```