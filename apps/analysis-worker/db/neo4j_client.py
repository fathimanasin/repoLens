import os

from neo4j import Driver, GraphDatabase


_driver: Driver | None = None


def get_neo4j_driver() -> Driver:
    global _driver

    if _driver is None:
        uri = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
        password = os.getenv("NEO4J_PASSWORD")

        if not password:
            raise RuntimeError("NEO4J_PASSWORD is not set")

        _driver = GraphDatabase.driver(
            uri,
            auth=("neo4j", password),
        )

    return _driver


def close_neo4j_driver() -> None:
    global _driver

    if _driver is not None:
        _driver.close()
        _driver = None