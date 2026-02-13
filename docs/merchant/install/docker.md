# 使用 Docker 安装系统

::: warning 注意
Docker 镜像不一定及时更新，如需最新版本请使用安装包方式部署。
:::

## docker run 命令行运行

```bash
docker run -d \
  --name xarr-pay-merchant \
  -e TZ=Asia/Shanghai \
  -p 32000:32000 \
  -v ./plugins:/app/plugins \
  -v ./config:/app/config \
  -v ./runtime:/app/runtime \
  --restart always \
  xiaoyi510/xarr-pay-merchant
```

## docker-compose 运行

创建 `docker-compose.yml` 文件：

```yaml
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

启动服务：

```bash
docker-compose up -d
```

## 安装系统

启动容器后，访问 `http://服务器IP:32000/install` 按照步骤完成安装。
