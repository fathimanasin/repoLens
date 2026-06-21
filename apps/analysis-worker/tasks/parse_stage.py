from dataclasses import dataclass, field
from pathlib import Path

from tree_sitter import Language, Parser
import tree_sitter_python


SKIP_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__",
    "venv",
    ".venv",
    ".next",
}


PY_LANGUAGE = Language(
    tree_sitter_python.language(),
    "python",
)


@dataclass
class Module:
    name: str
    file_path: str
    language: str
    imports: list = field(default_factory=list)
    classes: list = field(default_factory=list)
    functions: list = field(default_factory=list)
    line_count: int = 0


def _extract_imports(node, source: bytes) -> list[str]:
    imports = []

    if node.type == "import_statement":
        for child in node.children:
            if child.type == "dotted_name":
                imports.append(
                    source[
                        child.start_byte:child.end_byte
                    ].decode()
                )

    elif node.type == "import_from_statement":
        for child in node.children:
            if child.type == "dotted_name":
                imports.append(
                    source[
                        child.start_byte:child.end_byte
                    ].decode()
                )
                break

    for child in node.children:
        imports.extend(
            _extract_imports(child, source)
        )

    return imports


def _extract_definitions(
    node,
    source: bytes,
) -> tuple[list[str], list[str]]:
    classes = []
    functions = []

    if node.type == "class_definition":
        name_node = node.child_by_field_name("name")

        if name_node:
            classes.append(
                source[
                    name_node.start_byte:name_node.end_byte
                ].decode()
            )

    elif node.type == "function_definition":
        name_node = node.child_by_field_name("name")

        if name_node:
            functions.append(
                source[
                    name_node.start_byte:name_node.end_byte
                ].decode()
            )

    for child in node.children:
        child_classes, child_functions = (
            _extract_definitions(child, source)
        )

        classes.extend(child_classes)
        functions.extend(child_functions)

    return classes, functions


def parse_repository(clone_dir: str) -> list[Module]:
    parser = Parser()
    parser.set_language(PY_LANGUAGE)

    modules: list[Module] = []

    root = Path(clone_dir)

    for file_path in root.rglob("*.py"):
        if any(
            skip in file_path.parts
            for skip in SKIP_DIRS
        ):
            continue

        try:
            source = file_path.read_bytes()

            tree = parser.parse(source)

            imports = _extract_imports(
                tree.root_node,
                source,
            )

            classes, functions = (
                _extract_definitions(
                    tree.root_node,
                    source,
                )
            )

            line_count = (
                source.count(b"\n") + 1
            )

            modules.append(
                Module(
                    name=file_path.stem,
                    file_path=str(
                        file_path.relative_to(root)
                    ),
                    language="python",
                    imports=imports,
                    classes=classes,
                    functions=functions,
                    line_count=line_count,
                )
            )

        except Exception:
            continue

    return modules