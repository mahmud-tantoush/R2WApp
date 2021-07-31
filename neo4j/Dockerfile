FROM neo4j:4.2.7

ENV NEO4J_AUTH=neo4j/test

WORKDIR /var/lib/neo4j/import

COPY R2W.graphml ./

EXPOSE 7474 7473 7687

CMD ["neo4j"]
