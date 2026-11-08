const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const boundaries = require('eslint-plugin-boundaries');
const importPlugin = require('eslint-plugin-import');

const slicedLayerRootTypes = ['pages-root', 'widgets-root', 'features-root', 'entities-root'];

const elementTypeRules = [
  {
    from: ['bootstrap', 'app'],
    allow: [
      'app',
      'pages',
      'widgets',
      'features',
      'entities',
      'shared',
      'environment',
      ...slicedLayerRootTypes,
    ],
  },
  {
    from: 'pages',
    allow: [
      'widgets',
      'features',
      'entities',
      'shared',
      'widgets-root',
      'features-root',
      'entities-root',
    ],
  },
  {
    from: 'widgets',
    allow: ['features', 'entities', 'shared', 'features-root', 'entities-root'],
  },
  { from: 'features', allow: ['entities', 'shared', 'entities-root'] },
  { from: 'entities', allow: ['shared'] },
  { from: ['shared', 'app'], allow: ['environment'] },
  { from: 'pages-root', allow: ['pages'] },
  { from: 'widgets-root', allow: ['widgets'] },
  { from: 'features-root', allow: ['features'] },
  { from: 'entities-root', allow: ['entities'] },
  {
    from: [['entities', { slice: 'message' }]],
    allow: [['entities', { slice: 'chat' }]],
    importKind: 'type',
  },
];

const elementTypeOptions = {
  default: 'disallow',
  message: '${file.type} не может импортировать ${dependency.type}',
  rules: elementTypeRules,
};

module.exports = tseslint.config(
  {
    ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      boundaries,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json', './tsconfig.spec.json'],
          noWarnOnMultipleProjects: true,
        },
        node: true,
      },
      'boundaries/root-path': __dirname,
      'boundaries/dependency-nodes': ['import', 'export', 'dynamic-import'],
      'boundaries/elements': [
        { type: 'pages-root', pattern: 'src/pages/index.ts', mode: 'full' },
        { type: 'widgets-root', pattern: 'src/widgets/index.ts', mode: 'full' },
        { type: 'features-root', pattern: 'src/features/index.ts', mode: 'full' },
        { type: 'entities-root', pattern: 'src/entities/index.ts', mode: 'full' },
        { type: 'pages', pattern: 'src/pages/*', mode: 'folder', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*', mode: 'folder', capture: ['slice'] },
        { type: 'features', pattern: 'src/features/*', mode: 'folder', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*', mode: 'folder', capture: ['slice'] },
        { type: 'app', pattern: 'src/app', mode: 'folder' },
        { type: 'shared', pattern: 'src/shared', mode: 'folder' },
        { type: 'environment', pattern: 'src/environments', mode: 'folder' },
        { type: 'bootstrap', pattern: 'src/main.ts', mode: 'full' },
      ],
    },
    rules: {
      'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true }],
      'boundaries/element-types': ['error', elementTypeOptions],
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            { target: ['pages', 'widgets', 'features', 'entities'], allow: ['index.ts'] },
            { target: 'shared', allow: ['index.ts', '*/index.ts'] },
            { target: ['app', 'environment', ...slicedLayerRootTypes], allow: ['**'] },
          ],
        },
      ],
      'boundaries/no-unknown': 'error',
      'boundaries/no-unknown-files': 'error',
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, eslintConfigPrettier],
  },
);
