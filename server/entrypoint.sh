#!/bin/sh
echo "Starting app on PORT=$PORT"
exec java -jar app.jar --server.port=$PORT