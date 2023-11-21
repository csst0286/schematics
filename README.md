# Building Reusable Angular Components Using Schematics

This is the example project code for the PluralSight course *Building Reusable Angular Components Using Schematics*, by Dan Wellman

## Prerequisites

Node.js 6.9+
Angular CLI (globally installed)
Schematics CLI (globally installed)

**Remember to run an `npm install` the first time you run the project, to ensure the dependencies are installed.

## Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with
```bash
schematics --help
```

## Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

## Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
 