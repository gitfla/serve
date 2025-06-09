-- PostgreSQL schema using "texts" instead of "books"

DROP TABLE IF EXISTS texts CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS conversations_sentences CASCADE;
DROP TABLE IF EXISTS conversations_writers CASCADE;
DROP TABLE IF EXISTS sentences CASCADE;
DROP TABLE IF EXISTS writers CASCADE;

CREATE TABLE writers (
                         writer_id SERIAL PRIMARY KEY,
                         writer_name VARCHAR(70) NOT NULL
);

CREATE TABLE texts (
                       text_id SERIAL PRIMARY KEY,
                       title VARCHAR(90) NOT NULL,
                       text_writer INTEGER NOT NULL,
                       blob_id VARCHAR(90) NOT NULL,
                       CONSTRAINT fk_text_writer FOREIGN KEY (text_writer)
                           REFERENCES writers(writer_id)
                           ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE conversations (
                               conversation_id SERIAL PRIMARY KEY,
                               timestamp TIMESTAMP NOT NULL
);

CREATE TABLE conversations_sentences (
                                         conversation_sentence_id SERIAL PRIMARY KEY,
                                         conversation INTEGER NOT NULL,
                                         sentence_id INTEGER NOT NULL,
                                         CONSTRAINT fk_conversation FOREIGN KEY (conversation)
                                             REFERENCES conversations(conversation_id),
                                         CONSTRAINT fk_sentence FOREIGN KEY (sentence_id)
                                             REFERENCES sentences(sentence_id)
);

CREATE TABLE conversations_writers (
                                       conversation_writer_id SERIAL PRIMARY KEY,
                                       conversation_id INTEGER NOT NULL,
                                       writer_id INTEGER NOT NULL,
                                       CONSTRAINT fk_conversation_writer_convo FOREIGN KEY (conversation_id)
                                           REFERENCES conversations(conversation_id),
                                       CONSTRAINT fk_conversation_writer_writer FOREIGN KEY (writer_id)
                                           REFERENCES writers(writer_id)
);

CREATE TABLE sentences (
                           sentence_id SERIAL PRIMARY KEY,
                           text VARCHAR(420) NOT NULL,
                           text_id INTEGER NOT NULL,
                           CONSTRAINT fk_text_id FOREIGN KEY (text_id)
                               REFERENCES texts(text_id)
);