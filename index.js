'use strict';

const fs = require('fs');

const chalk = require('chalk');
const globby = require('globby');
const ProgressBar = require('progress');
const recast = require('ember-template-recast');

const b = recast.builders;

const TEST_SELECTOR_PREFIX = /data-test-.*/;
const NUM_STEPS = 2;

async function run(argv, cwd) {
  let step = num => chalk.dim(`[${num}/${NUM_STEPS}]`);

  let patterns = argv.slice(2);
  if (patterns.length === 0) {
    patterns.push('app/**/*.hbs');
    patterns.push('addon/**/*.hbs');
  }

  console.log(`${step(1)} 🔍  Looking for templates...`);
  let templatePaths = await globby(patterns, { cwd });

  console.log(`${step(2)} 👷‍  Migrating ${templatePaths.length} templates...`);

  let bar = new ProgressBar(`${chalk.dim('[:bar]')} :percent :etas`, {
    total: templatePaths.length,
    complete: '>',
    incomplete: ' ',
    width: 40,
  });

  for (let templatePath of templatePaths) {
    let content;
    try {
      content = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      bar.interrupt(chalk.red(`Could not read file ${templatePath}: ${error}`));
      bar.tick();
      continue;
    }

    let root;
    try {
      root = recast.parse(content);
    } catch (error) {
      bar.interrupt(chalk.red(`Could not parse file ${templatePath}: ${error}`));
      bar.tick();
      continue;
    }

    let newContent;
    try {
      transform(root);
      newContent = recast.print(root);
    } catch (error) {
      bar.interrupt(chalk.red(`Could not transform file ${templatePath}: ${error}`));
      bar.tick();
      continue;
    }

    if (newContent !== content) {
      try {
        fs.writeFileSync(templatePath, newContent, 'utf8');
      } catch (error) {
        bar.interrupt(chalk.red(`Could not write file ${templatePath}: ${error}`));
        bar.tick();
        continue;
      }
    }

    bar.tick();
  }
}

function transform(root) {
  recast.traverse(root, {
    MustacheStatement(node) {
      transformMustache(node);
    },
    BlockStatement(node) {
      transformMustache(node);
    },
  });
}

function transformMustache(node) {
  // add test selectors to `Hash` arguments
  node.hash.pairs = node.hash.pairs.concat(
    node.params
      .filter(param => isTestSelectorParam(param))
      .map(path => b.pair(path.original, b.boolean(true)))
  );

  // remove test selectors from positional arguments
  node.params = node.params.filter(param => !isTestSelectorParam(param));
}

function isTestSelectorParam(param) {
  return param.type === 'PathExpression' && TEST_SELECTOR_PREFIX.test(param.original);
}

module.exports = { run, transform };
