FROM node:18-alpine as build
RUN apk add git
RUN git clone https://github.com/jkpe/ghost-storage-adapter-s3
RUN git clone https://github.com/jkpe/Alto
RUN cd ghost-storage-adapter-s3 && npm install

FROM ghost:5.72.1
COPY --from=build ghost-storage-adapter-s3 content/adapters/storage/s3
COPY --from=build Alto content/themes/alto
COPY --from=build Alto content/themes/alto-jack

EXPOSE 2368/tcp
