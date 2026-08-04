FROM flyway/flyway:10

ADD --checksum=sha256:d77962877d010777cff997015da90ee689f0f4bb76848340e1488f2b83332af5 https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.4.0/mysql-connector-j-8.4.0.jar /flyway/drivers/mysql-connector-j-8.4.0.jar
