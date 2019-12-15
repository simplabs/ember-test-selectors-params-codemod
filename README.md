ember-test-selectors-params-codemod
==============================================================================

Codemod for [ember-test-selectors] users to migrate from positional params to named arguments

[ember-test-selectors]: https://github.com/simplabs/ember-test-selectors/


Description
------------------------------------------------------------------------------

[ember-test-selectors] allowed developers to use positional arguments:
 
```hbs
{{some-component data-test-foo}}
```

... instead of named arguments for their test selectors:

```hbs
{{some-component data-test-foo=true}}
```

This was done to have a more convenient API in some cases but turned out to
cause confusion and is no longer needed when using Angle Bracket Syntax:

```hbs
<SomeComponent data-test-foo />
```

This codemod will turn positional `data-test-foo` selectors into their
equivalent `data-test-foo=true` named selector. 


Usage
------------------------------------------------------------------------------

```bash
npx ember-test-selectors-params-codemod
```

This will automatically run the codemod on all `.hbs` files in your `app` and
`addon` folders (if they exist). If you want to run the codemod on other
folders or files you can also pass a glob pattern:

```bash
npx ember-test-selectors-params-codemod /some/other/folder/**/*.hbs
```


License
------------------------------------------------------------------------------

This projects is developed by and &copy; [simplabs GmbH](http://simplabs.com)
and contributors. It is released under the [MIT License](LICENSE.md).
