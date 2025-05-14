# 使用官方的 Node.js 镜像作为基础镜像
FROM node:18 AS build

# 定义构建时传入的参数
ARG VITE_BASE_API_PREFIX
ARG VITE_BASE_API_URL
ARG VITE_GITHUB_CLIENT_ID
ARG VITE_APP_BASE_URL

# 设置环境变量
ENV VITE_BASE_API_PREFIX=${VITE_BASE_API_PREFIX}
ENV VITE_BASE_API_URL=${VITE_BASE_API_URL}
ENV VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID}
ENV VITE_APP_BASE_URL=${VITE_APP_BASE_URL}

# 设置工作目录
WORKDIR /app

# 将本地的 package.json 和 package-lock.json 复制到容器中
COPY package*.json ./

# 安装依赖
RUN npm install

# 将项目文件复制到容器中
COPY . .

# 打包 Vue 项目
RUN npm run build

# 使用一个轻量级的 nginx 镜像来作为运行环境
FROM nginx:alpine

# 将构建好的文件复制到 nginx 的静态文件目录
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx 服务
CMD ["nginx", "-g", "daemon off;"]
