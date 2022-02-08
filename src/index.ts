import TypeDoc from "typedoc";

const app = new TypeDoc.Application();

app.options.addReader(new TypeDoc.TSConfigReader());
app.options.addReader(new TypeDoc.TypeDocReader());

app.bootstrap({
  entryPoints: ["src/index.ts"],
});

const project = app.convert();

if (project) {
}
