import { join } from "path";

const spec: TsDocSchema = require(join(__dirname, "../fixtures/out.json"));

type TsDocSchema = {
  children: [
    {
      id: number;
      name: string;
      kindString: string;
      comment?: {
        shortText: string;
      };
      children?: Child[];
    }
  ];
  groups: [
    {
      title: string;
      children: number[];
    }
  ];
};

type Child = TsDocSchema["children"][number];

type Group = TsDocSchema["groups"][number];

function renderGroup(group: Group): [string, string] {
  return [
    group.title,
    `# ${group.title || "fish"}

${group.children
  .map((id) => {
    const reflection = findById(id);
    if (reflection) {
      return renderReflection(reflection);
    }
  })
  .join("\n")}`,
  ];
}

function findById(id: number): Child | undefined {
  return spec.children.find((child) => child.id === id);
}

function defaultSerialization(reflection: Child): string {
  return `# ${reflection.name || `No name for object ${reflection}`}

_${reflection.kindString}_

${reflection.comment?.shortText || "No description"}
  
${
  reflection?.children
    ?.map((child) => renderReflection(child))
    .filter(Boolean)
    .join("\n") || ""
}`;
}

function childrenAreAllProperties(children: Child[]): boolean {
  return children.reduce<boolean>(
    (acc, { kindString }) => acc && kindString === "Property",
    true
  );
}

function interfaceSerialization(reflection: Child): string {
  return `### ${reflection.name || `No name for object ${reflection}`}

_${reflection.kindString}_

${reflection.comment?.shortText || "No description"}

${
  reflection.children && childrenAreAllProperties(reflection.children)
    ? `<table>
<thead><th>Name</th><th>Description</th></thead>
<tbody>
${
  reflection?.children
    ?.map((child) => renderReflection(child))
    .filter(Boolean)
    .join("\n") || ""
}
</tbody>
</table>`
    : reflection?.children
        ?.map((child) => renderReflection(child))
        .filter(Boolean)
        .join("\n") || ""
}

`;
}

function propertySerialization(reflection: Child): string {
  return `<tr><td>${
    reflection.name || `No name for object ${reflection}`
  }*</td><td>${reflection.comment?.shortText || "No description"}</td></tr>`;
}

function classSerialization(reflection: Child): string {
  return `## ${reflection.name || `No name for object ${reflection}`}

_${reflection.kindString}_

${reflection.comment?.shortText || "No description"}

${
  reflection.children
    ?.map((child) => renderReflection(child))
    .filter(Boolean)
    .join("\n") || ""
}`;
}

function methodSerialization(reflection: Child): string {
  return `### ${reflection.name || `No name for object ${reflection}`}

_${reflection.kindString}_

${reflection.comment?.shortText || "No description"}

${
  reflection.children
    ?.map((child) => renderReflection(child))
    .filter(Boolean)
    .join("\n") || ""
}`;
}
function renderReflection(reflection: Child): string {
  switch (reflection.kindString) {
    case "Method":
      return methodSerialization(reflection);
    case "Class":
      return classSerialization(reflection);
    case "Property":
      return propertySerialization(reflection);
    case "Interface":
      return interfaceSerialization(reflection);
    default:
      return defaultSerialization(reflection);
  }
}

const result = spec.groups?.map((group) => {
  let [name, serialization] = renderGroup(group);
  return { name, serialization };
});

// console.log(JSON.stringify(result, null, 2));
console.log(result[0].serialization);
