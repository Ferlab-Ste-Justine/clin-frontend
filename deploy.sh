docker-compose build
docker tag localhost:5000/clin-frontend-nginx:latest localhost:5000/clin-frontend-nginx:${1}
docker push localhost:5000/clin-frontend-nginx:${1}
docker service update qaFront_nginx --image localhost:5000/clin-frontend-nginx:${1}
