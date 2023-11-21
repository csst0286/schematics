import { Tree, SchematicContext } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import * as angularJsonStub from './stubs/angular.json';
import * as appModuleStub from './stubs/app.module.json';
import * as packageJsonStub from './stubs/package.json';
import * as packageJsonMaterialStub from './stubs/package-material.json';
import { installMaterial } from '../order-wizard/index';

const collectionPath = path.join(__dirname, '../collection.json');
let testTree: Tree;

beforeEach(() => {
  testTree = Tree.empty();
  testTree.create('./angular.json', JSON.stringify(angularJsonStub));
  testTree.create('./src/app/app.module.ts', JSON.stringify(appModuleStub.content));
  testTree.create('./package.json', JSON.stringify(packageJsonStub));
});

describe('order-wizard', () => {

  describe('when creating files', () => {

    it('creates the right number of files', () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = runner.runSchematic('order-wizard', { name: 'test' }, testTree);

      expect(tree.files.length).toEqual(10);
    });

    it('gives files the correct names', () => {
      const nameOption = 'test';
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = runner.runSchematic('order-wizard', { name: nameOption }, testTree);

      tree.files.slice(3).forEach((filePath: string) => {
        expect(filePath.includes(`/${nameOption}/${nameOption}`)).toEqual(true);
      });
    });

    it('can create files under a deeper path', () => {
      const nameOption = 'test';
      const pathOption = 'fake-path';
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = runner.runSchematic('order-wizard', { name: nameOption, path: pathOption }, testTree);

      tree.files.slice(3).forEach((filePath: string) => {
        expect(filePath.startsWith(`/${pathOption}/`)).toEqual(true);
      });
    });

    it('does not create test files when spec is false', () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = runner.runSchematic('order-wizard', { name: 'test', spec: 'false' }, testTree);

      expect(tree.files.length).toEqual(8);
    });

  });

  describe('when inserting content', () => {

    it('updates template files correctly', () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = runner.runSchematic('order-wizard', { name: 'test' }, testTree);
      const servicePath = tree.files.pop() || '';
      const service = tree.read(servicePath);
      
      expect(service).toContain('export class TestService');
    });

    it('adds a new import to the root module', () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = runner.runSchematic('order-wizard', { name: 'test' }, testTree);
      const module = tree.read('./src/app/app.module.ts');

      expect(module).toContain(`import { TestModule } from './/test/test.module';`);
    });

    it('adds a new module to the imports array in the root module', () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = runner.runSchematic('order-wizard', { name: 'test' }, testTree);
      const module = tree.read('./src/app/app.module.ts');

      expect(module).toContain(', TestModule');
    });

  });

  describe('when installing dependencies', () => {
    let contextStub: SchematicContext;

    beforeEach(() => {
      contextStub = {
        debug: false,
        engine: jasmine.createSpyObj('engine', [
          'createCollection', 'createContext', 'createSchematic',
          'createSourceFromUrl', 'transformOptions', 'executePostTasks'
        ]),
        logger: jasmine.createSpyObj('logger', ['info']),
        schematic: jasmine.createSpyObj('schematic', ['call']),
        strategy: 0,
        interactive: false,
        addTask: jasmine.createSpy('addTask')
      };
    });

    it('schedules an npm install task if Material is not installed', () => {
      const rule = installMaterial();
      rule(testTree, contextStub);

      expect(contextStub.addTask).toHaveBeenCalled();
      expect(contextStub.logger.info).toHaveBeenCalledWith('Installing Angular Material');
    });

    it('does not schedule a task if Material is installed', () => {
      testTree.overwrite('./package.json', JSON.stringify(packageJsonMaterialStub));
      const rule = installMaterial();
      rule(testTree, contextStub);

      expect(contextStub.addTask).not.toHaveBeenCalled();
      expect(contextStub.logger.info).toHaveBeenCalledWith('Angular Material already installed');
    });
  });
});
