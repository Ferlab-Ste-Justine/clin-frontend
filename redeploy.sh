docker-compose build
docker tag localhost:5000/clin-frontend-nginx:latest localhost:5000/clin-frontend-nginx:${1}
docker push localhost:5000/clin-frontend-nginx:latest
docker push localhost:5000/clin-frontend-nginx:${1}
docker stack rm qaFront
docker stack deploy -c docker-compose.yml qaFront
docker service update qaFront_nginx --image localhost:5000/clin-frontend-nginx:${1}
