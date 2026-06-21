from neo4j import Driver


def build_dependency_graph(
    modules: list,
    repository_id: str,
    driver: Driver,
) -> list[str]:
    """
    Returns: list of module names involved in circular dependencies
    """

    with driver.session() as session:
        session.run(
            """
            MATCH (m:Module {repositoryId: $rid})
            DETACH DELETE m
            """,
            rid=repository_id,
        )

        for module in modules:
            session.run(
                """
                CREATE (m:Module {
                    repositoryId: $rid,
                    name: $name,
                    filePath: $filePath,
                    language: $language,
                    lineCount: $lineCount
                })
                """,
                rid=repository_id,
                name=module.name,
                filePath=module.file_path,
                language=module.language,
                lineCount=module.line_count,
            )

        module_names = {
            module.name
            for module in modules
        }

        for module in modules:
            for imp in module.imports:
                segment = imp.split(".")[-1]

                if (
                    segment in module_names
                    and segment != module.name
                ):
                    session.run(
                        """
                        MATCH (
                            a:Module {
                                repositoryId: $rid,
                                name: $from_name
                            }
                        )
                        MATCH (
                            b:Module {
                                repositoryId: $rid,
                                name: $to_name
                            }
                        )
                        MERGE (a)-[:DEPENDS_ON]->(b)
                        """,
                        rid=repository_id,
                        from_name=module.name,
                        to_name=segment,
                    )

        result = session.run(
            """
            MATCH path =
                (a:Module {repositoryId: $rid})
                -[:DEPENDS_ON*2..5]->
                (a)

            RETURN DISTINCT
                a.name AS module_name
            """,
            rid=repository_id,
        )

        circular = [
            record["module_name"]
            for record in result
        ]

    return circular