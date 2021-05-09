FROM mariadb:latest

ADD sql/ /docker-entrypoint-initdb.d

ENV MYSQL_ROOT_PASSWORD test
ENV MYSQL_DATABASE techevents_users
ENV MYSQL_USER root

RUN apt-get update && apt-get -y install vim

EXPOSE 3306

CMD ["mysqld"]

# docker build -t mariadb .
# docker run -dp 3306:3306 --name mariadb mariadb