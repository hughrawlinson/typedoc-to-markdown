import { join } from "path";
import { ProjectReflection } from "typedoc";
import { ModelToObject } from "typedoc/dist/lib/serialization/schema";

type TsDocSchema = ModelToObject<ProjectReflection>;
const spec: TsDocSchema = require(join(
  __dirname,
  // "../fixtures/streamr-client-javascript.json"
  "../fixtures/typedoc.json"
));

// type TsDocSchema = {
//   children: [
//     {
//       id: number;
//       name: string;
//       kindString: string;
//       comment?: {
//         shortText: string;
//         text?: string;
//       };
//       children?: Child[];
//     }
//   ];
//   groups: [
//     {
//       title: string;
//       children: number[];
//     }
//   ];
// };

type Child = NonNullable<TsDocSchema["children"]>[number];

type Group = NonNullable<TsDocSchema["groups"]>[number];

type TypedocType = Child["type"];

function headingForDepth(n: number) {
  return "#".repeat(n);
}

function renderGroup(group: Group): [string, string] {
  return [
    group.title,
    `# ${group.title || "fish"}

${group.children
  ?.map((id) => {
    const reflection = findById(id);
    if (reflection) {
      return renderReflection(reflection, { depth: 1 });
    }
  })
  .join("\n")}`,
  ];
}

function findById(id: number): Child | undefined {
  return spec.children?.find((child) => child.id === id);
}

function defaultSerialization(reflection: Child, options: Options): string {
  return `${headingForDepth(options.depth)} ${
    reflection.name || `No name for object ${reflection}`
  }

_${reflection.kindString}_

${reflection.comment?.shortText || "No description"}
  
${
  reflection?.children
    ?.map((child) => renderReflection(child, options))
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

function interfaceSerialization(reflection: Child, options: Options): string {
  return `${headingForDepth(options.depth)} ${
    reflection.name || `No name for object ${reflection}`
  }

_${reflection.kindString}_

${reflection.comment?.shortText || ""}

${reflection.comment?.text || ""}

${
  reflection.children && childrenAreAllProperties(reflection.children)
    ? `<table>
<thead><th>Name</th><th>Description</th></thead>
<tbody>
${
  reflection?.children
    ?.map((child) => renderReflection(child, { ...options, asTableRow: true }))
    .filter(Boolean)
    .join("\n") || ""
}
</tbody>
</table>`
    : reflection?.children
        ?.map((child) => renderReflection(child, options))
        .filter(Boolean)
        .join("\n") || ""
}

`;
}

type Options = {
  depth: number;
  asTableRow?: boolean;
};

function propertySerialization(reflection: Child, options: Options): string {
  if (options?.asTableRow) {
    return `<tr><td>${
      reflection.name || `No name for object ${reflection}`
    }*</td><td>${reflection.comment?.shortText || "No description"}</td></tr>`;
  }

  return `${headingForDepth(options.depth)} ${
    reflection.name || `No name for object ${reflection}`
  }`;
}

function classSerialization(reflection: Child, options: Options): string {
  return `${headingForDepth(options.depth)} ${
    reflection.name || `No name for object ${reflection}`
  }

<details>

<summary>${reflection.kindString}</summary>

${reflection.comment?.shortText || "No description"}

${
  reflection.children
    ?.map((child) => renderReflection(child, options))
    .filter(Boolean)
    .join("\n") || ""
}

</details>
`;
}

function methodSerialization(reflection: Child, options: Options): string {
  return `${headingForDepth(options.depth)} ${
    reflection.name || `No name for object ${reflection}`
  }

_${reflection.kindString}_

${reflection.comment?.shortText || "No description"}

${
  reflection.children
    ?.map((child) => renderReflection(child, options))
    .filter(Boolean)
    .join("\n") || ""
}`;
}

function renderReflection(reflection: Child, _options: Options): string {
  const options = {
    ..._options,
    depth: _options.depth + 1,
  };
  switch (reflection.kindString) {
    case "Method":
      return methodSerialization(reflection, options);
    case "Constructor":
      return methodSerialization(reflection, options);
    case "Class":
      return classSerialization(reflection, options);
    case "Property":
      return propertySerialization(reflection, options);
    case "Interface":
      return interfaceSerialization(reflection, options);
    default:
      return defaultSerialization(reflection, options);
  }
}

const result = spec.groups?.map((group) => {
  let [name, serialization] = renderGroup(group);
  return { name, serialization };
});

// console.log(JSON.stringify(result, null, 2));
console.log(result?.[0].serialization);
