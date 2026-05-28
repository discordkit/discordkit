import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  run: {
    tasks: {
      build: { command: "vp run -r build", cache: true },
      "build:apps": { command: "vp run -r build:apps", cache: true },
      "build:examples": { command: "vp run -r build:examples", cache: true },
      "build:all": {
        command: "vp run build && vp run build:apps && vp run build:examples",
        cache: true
      },
      lint: { command: "vp lint", cache: true },
      dev: { command: "vp run -r --parallel dev", cache: false },
      ci: { command: "vp lint && vp test && vp run build:all", cache: false }
    }
  },
  resolve: {
    alias: {
      "mock-utils": `./scripts/mock-utils.ts`
    }
  },
  test: {
    name: `discordkit`,
    globals: true,
    watch: false,
    environment: `happy-dom`,
    coverage: {
      provider: `v8`
    }
  },
  lint: {
    "plugins": [
      "oxc",
      "typescript",
      "unicorn",
      "react",
      "import",
      "promise"
    ],
    "jsPlugins": [
      "@stylistic/eslint-plugin"
    ],
    "categories": {
      "correctness": "warn"
    },
    "options": {
      "typeAware": true,
      "typeCheck": true
    },
    "env": {
      "builtin": true
    },
    "settings": {
      "import-x/extensions": [
        ".cjs",
        ".mjs",
        ".js",
        ".jsx",
        ".cts",
        ".mts",
        ".ts",
        ".tsx"
      ],
      "import-x/resolver-next": [
        {
          "interfaceVersion": 3,
          "name": "eslint-import-resolver-typescript"
        },
        {
          "interfaceVersion": 3,
          "name": "eslint-plugin-import-x:node"
        }
      ]
    },
    "ignorePatterns": [
      ".yarn/**/*",
      "coverage/**/*",
      "**/.next/**/*",
      "**/dist/**/*"
    ],
    "rules": {
      "promise/always-return": "error",
      "promise/catch-or-return": [
        "error",
        {
          "terminationMethod": [
            "catch",
            "finally"
          ]
        }
      ],
      "promise/no-multiple-resolved": "error",
      "promise/no-nesting": "warn",
      "promise/no-new-statics": "error",
      "promise/no-promise-in-callback": "warn",
      "promise/no-return-in-finally": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/prefer-await-to-callbacks": "error",
      "promise/prefer-await-to-then": "error",
      "promise/valid-params": "error",
      "@stylistic/array-bracket-spacing": "warn",
      "@stylistic/array-element-newline": [
        "warn",
        {
          "consistent": true,
          "multiline": true
        }
      ],
      "@stylistic/arrow-parens": [
        "warn",
        "always"
      ],
      "@stylistic/arrow-spacing": [
        "warn",
        {
          "before": true,
          "after": true
        }
      ],
      "@stylistic/block-spacing": [
        "warn",
        "always"
      ],
      "@stylistic/brace-style": [
        "warn",
        "1tbs",
        {
          "allowSingleLine": true
        }
      ],
      "@stylistic/comma-dangle": [
        "warn",
        "never"
      ],
      "@stylistic/comma-spacing": [
        "warn",
        {
          "before": false,
          "after": true
        }
      ],
      "@stylistic/comma-style": [
        "warn",
        "last"
      ],
      "@stylistic/computed-property-spacing": "warn",
      "@stylistic/curly-newline": "warn",
      "@stylistic/dot-location": [
        "warn",
        "property"
      ],
      "@stylistic/eol-last": "warn",
      "@stylistic/function-call-argument-newline": [
        "warn",
        "consistent"
      ],
      "@stylistic/function-call-spacing": "warn",
      "@stylistic/generator-star-spacing": [
        "warn",
        {
          "before": false,
          "after": true,
          "method": {
            "before": true,
            "after": false
          }
        }
      ],
      "@stylistic/jsx-child-element-spacing": "warn",
      "@stylistic/jsx-closing-bracket-location": [
        "warn",
        "tag-aligned"
      ],
      "@stylistic/jsx-closing-tag-location": [
        "warn",
        "tag-aligned"
      ],
      "@stylistic/jsx-curly-spacing": [
        "warn",
        "never",
        {
          "allowMultiline": false,
          "spacing": {
            "objectLiterals": "always"
          }
        }
      ],
      "@stylistic/jsx-equals-spacing": [
        "warn",
        "never"
      ],
      "@stylistic/jsx-first-prop-new-line": [
        "warn",
        "multiline"
      ],
      "@stylistic/jsx-indent-props": [
        "warn",
        2
      ],
      "@stylistic/jsx-newline": [
        "warn",
        {
          "prevent": true,
          "allowMultilines": true
        }
      ],
      "@stylistic/jsx-one-expression-per-line": [
        "warn",
        {
          "allow": "single-child"
        }
      ],
      "@stylistic/jsx-quotes": [
        "warn",
        "prefer-double"
      ],
      "@stylistic/jsx-self-closing-comp": [
        "warn",
        {
          "component": true,
          "html": true
        }
      ],
      "@stylistic/jsx-tag-spacing": "warn",
      "@stylistic/jsx-wrap-multilines": "warn",
      "@stylistic/keyword-spacing": [
        "warn",
        {
          "before": true,
          "after": true
        }
      ],
      "@stylistic/lines-between-class-members": [
        "warn",
        "always",
        {
          "exceptAfterSingleLine": true
        }
      ],
      "@stylistic/new-parens": "warn",
      "@stylistic/no-extra-semi": "warn",
      "@stylistic/no-floating-decimal": "warn",
      "@stylistic/no-mixed-spaces-and-tabs": [
        "warn",
        "smart-tabs"
      ],
      "@stylistic/no-multi-spaces": [
        "warn",
        {
          "exceptions": {
            "Property": true,
            "VariableDeclarator": true,
            "ImportDeclaration": true
          }
        }
      ],
      "@stylistic/no-multiple-empty-lines": [
        "warn",
        {
          "max": 2
        }
      ],
      "@stylistic/no-trailing-spaces": "warn",
      "@stylistic/no-whitespace-before-property": "warn",
      "@stylistic/object-curly-newline": [
        "warn",
        {
          "ObjectExpression": {
            "multiline": true,
            "consistent": true
          },
          "ObjectPattern": {
            "multiline": true,
            "consistent": true
          }
        }
      ],
      "@stylistic/object-curly-spacing": [
        "warn",
        "always"
      ],
      "@stylistic/one-var-declaration-per-line": [
        "warn",
        "initializations"
      ],
      "@stylistic/padded-blocks": [
        "warn",
        "never"
      ],
      "@stylistic/quote-props": [
        "warn",
        "as-needed"
      ],
      "@stylistic/quotes": [
        "warn",
        "backtick",
        {
          "avoidEscape": true
        }
      ],
      "@stylistic/rest-spread-spacing": [
        "warn",
        "never"
      ],
      "@stylistic/semi": [
        "warn",
        "always"
      ],
      "@stylistic/semi-spacing": [
        "warn",
        {
          "before": false,
          "after": true
        }
      ],
      "@stylistic/semi-style": [
        "warn",
        "last"
      ],
      "@stylistic/space-before-blocks": "warn",
      "@stylistic/space-before-function-paren": [
        "warn",
        {
          "anonymous": "never",
          "named": "never",
          "asyncArrow": "always"
        }
      ],
      "@stylistic/space-in-parens": [
        "warn",
        "never"
      ],
      "@stylistic/space-infix-ops": [
        "warn",
        {
          "int32Hint": false
        }
      ],
      "@stylistic/space-unary-ops": [
        "warn",
        {
          "words": true,
          "nonwords": false
        }
      ],
      "@stylistic/spaced-comment": [
        "warn",
        "always",
        {
          "exceptions": [
            "?"
          ]
        }
      ],
      "@stylistic/switch-colon-spacing": [
        "warn",
        {
          "before": false,
          "after": true
        }
      ],
      "@stylistic/template-curly-spacing": [
        "warn",
        "never"
      ],
      "@stylistic/template-tag-spacing": [
        "warn",
        "never"
      ],
      "@stylistic/type-annotation-spacing": "warn",
      "@stylistic/type-named-tuple-spacing": "warn",
      "@stylistic/wrap-iife": [
        "warn",
        "any"
      ],
      "@stylistic/yield-star-spacing": [
        "warn",
        {
          "before": false,
          "after": true
        }
      ],
      "import/export": "error",
      "import/no-empty-named-blocks": "warn",
      "import/no-mutable-exports": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn",
      "import/default": "error",
      "import/named": "error",
      "import/namespace": "error",
      "import/no-absolute-path": "error",
      "import/no-cycle": "warn",
      "import/no-dynamic-require": "error",
      "import/no-self-import": "error",
      "import/no-webpack-loader-syntax": "error",
      "import/first": [
        "error",
        "absolute-first"
      ],
      "import/no-anonymous-default-export": "warn",
      "import/no-default-export": "warn",
      "import/no-duplicates": "error"
    },
    "overrides": [
      {
        "files": [
          "**/*.?(m|c)js?(x)"
        ],
        "rules": {
          "array-callback-return": [
            "warn",
            {
              "allowImplicit": true,
              "checkForEach": true
            }
          ],
          "constructor-super": "error",
          "for-direction": "error",
          "getter-return": "error",
          "no-async-promise-executor": "error",
          "no-await-in-loop": "error",
          "no-class-assign": "error",
          "no-compare-neg-zero": "error",
          "no-cond-assign": [
            "error",
            "always"
          ],
          "no-const-assign": "error",
          "no-constant-binary-expression": "error",
          "no-constant-condition": "warn",
          "no-constructor-return": "error",
          "no-control-regex": "error",
          "no-debugger": "warn",
          "no-dupe-class-members": "error",
          "no-dupe-else-if": "error",
          "no-dupe-keys": "error",
          "no-duplicate-case": "error",
          "no-duplicate-imports": [
            "error",
            {
              "includeExports": true
            }
          ],
          "no-empty-character-class": "error",
          "no-empty-pattern": "error",
          "no-ex-assign": "error",
          "no-fallthrough": "error",
          "no-func-assign": "error",
          "no-import-assign": "error",
          "no-inner-declarations": "error",
          "no-invalid-regexp": "error",
          "no-irregular-whitespace": "error",
          "no-loss-of-precision": "error",
          "no-misleading-character-class": "error",
          "no-new-native-nonconstructor": "warn",
          "no-obj-calls": "error",
          "no-promise-executor-return": "error",
          "no-prototype-builtins": "error",
          "no-self-assign": "error",
          "no-self-compare": "error",
          "no-setter-return": "error",
          "no-sparse-arrays": "error",
          "no-template-curly-in-string": "error",
          "no-this-before-super": "error",
          "no-unassigned-vars": "error",
          "no-undef": "error",
          "no-unexpected-multiline": "off",
          "no-unmodified-loop-condition": "warn",
          "no-unreachable": "error",
          "no-unsafe-finally": "error",
          "no-unsafe-negation": "error",
          "no-unsafe-optional-chaining": "error",
          "no-unused-private-class-members": "warn",
          "no-unused-vars": "warn",
          "no-use-before-define": [
            "error",
            {
              "functions": false
            }
          ],
          "no-useless-assignment": "error",
          "no-useless-backreference": "error",
          "use-isnan": "error",
          "valid-typeof": "error",
          "accessor-pairs": "error",
          "arrow-body-style": [
            "error",
            "as-needed"
          ],
          "block-scoped-var": "error",
          "capitalized-comments": "off",
          "class-methods-use-this": "off",
          "complexity": "off",
          "curly": [
            "error",
            "multi-line"
          ],
          "default-case": "error",
          "default-case-last": "error",
          "default-param-last": "error",
          "eqeqeq": [
            "error",
            "smart"
          ],
          "func-name-matching": "off",
          "func-names": "off",
          "func-style": [
            "error",
            "declaration",
            {
              "allowArrowFunctions": true
            }
          ],
          "grouped-accessor-pairs": "error",
          "guard-for-in": "error",
          "id-length": "off",
          "init-declarations": "off",
          "logical-assignment-operators": [
            "error",
            "always",
            {
              "enforceForIfStatements": true
            }
          ],
          "max-classes-per-file": "off",
          "max-depth": "off",
          "max-lines": "off",
          "max-lines-per-function": "off",
          "max-nested-callbacks": "off",
          "max-params": "off",
          "max-statements": "off",
          "new-cap": [
            "error",
            {
              "newIsCap": true
            }
          ],
          "no-alert": "error",
          "no-array-constructor": "off",
          "no-bitwise": [
            "error",
            {
              "allow": [
                "~"
              ]
            }
          ],
          "no-caller": "error",
          "no-case-declarations": "error",
          "no-console": "warn",
          "no-continue": "error",
          "no-delete-var": "error",
          "no-div-regex": "error",
          "no-else-return": "error",
          "no-empty": "error",
          "no-empty-function": [
            "error",
            {
              "allow": [
                "arrowFunctions",
                "constructors"
              ]
            }
          ],
          "no-empty-static-block": "error",
          "no-eq-null": "error",
          "no-eval": "error",
          "no-extend-native": "error",
          "no-extra-bind": "error",
          "no-extra-boolean-cast": "error",
          "no-extra-label": "error",
          "no-global-assign": "error",
          "no-implicit-coercion": "off",
          "no-inline-comments": "off",
          "no-iterator": "error",
          "no-label-var": "error",
          "no-labels": "error",
          "no-lone-blocks": "error",
          "no-lonely-if": "error",
          "no-loop-func": "error",
          "no-magic-numbers": "off",
          "no-multi-assign": "error",
          "no-multi-str": "error",
          "no-negated-condition": "error",
          "no-nested-ternary": "off",
          "no-new": "error",
          "no-new-func": "error",
          "no-new-wrappers": "error",
          "no-nonoctal-decimal-escape": "error",
          "no-object-constructor": "error",
          "no-param-reassign": "error",
          "no-plusplus": "off",
          "no-proto": "error",
          "no-redeclare": "error",
          "no-regex-spaces": "error",
          "no-restricted-exports": "off",
          "no-restricted-globals": "off",
          "no-restricted-imports": "off",
          "no-restricted-properties": "off",
          "no-return-assign": [
            "error",
            "always"
          ],
          "no-script-url": "error",
          "no-sequences": "error",
          "no-shadow": "error",
          "no-shadow-restricted-names": "error",
          "no-ternary": "off",
          "no-throw-literal": "error",
          "no-undefined": "error",
          "no-underscore-dangle": "off",
          "no-unneeded-ternary": "error",
          "no-unused-expressions": "off",
          "no-unused-labels": "error",
          "no-useless-call": "error",
          "no-useless-catch": "error",
          "no-useless-computed-key": "error",
          "no-useless-concat": "error",
          "no-useless-constructor": "error",
          "no-useless-escape": "error",
          "no-useless-rename": "error",
          "no-useless-return": "error",
          "no-var": "error",
          "no-void": [
            "error",
            {
              "allowAsStatement": true
            }
          ],
          "no-warning-comments": "off",
          "no-with": "error",
          "object-shorthand": [
            "error",
            "properties"
          ],
          "operator-assignment": [
            "error",
            "always"
          ],
          "prefer-const": "off",
          "prefer-destructuring": "off",
          "prefer-exponentiation-operator": "error",
          "prefer-numeric-literals": "error",
          "prefer-object-has-own": "error",
          "prefer-object-spread": "error",
          "prefer-promise-reject-errors": "error",
          "prefer-rest-params": "error",
          "prefer-spread": "error",
          "prefer-template": "error",
          "radix": "error",
          "require-await": "error",
          "require-unicode-regexp": "off",
          "require-yield": "error",
          "sort-keys": "off",
          "sort-vars": "off",
          "symbol-description": "error",
          "vars-on-top": "error",
          "yoda": "error",
          "unicode-bom": "off",
          "typescript/consistent-return": "off",
          "typescript/dot-notation": [
            "error",
            {
              "allowKeywords": true
            }
          ]
        }
      },
      {
        "files": [
          "**/*.{spec,test}.{j,t}s?(x)"
        ],
        "rules": {
          "no-console": "off",
          "no-undefined": "off"
        }
      },
      {
        "files": [
          "*.stories.{j,t}s?(x)",
          "*.config.?(m|c){j,t}s"
        ],
        "rules": {
          "import/no-default-export": "off",
          "import/no-anonymous-default-export": "off"
        }
      },
      {
        "files": [
          "examples/with-nextjs/src/**/*.{j,t}s?(x)"
        ],
        "rules": {
          "react/rules-of-hooks": "error",
          "react/exhaustive-deps": "warn",
          "jsx-a11y/alt-text": "error",
          "jsx-a11y/anchor-ambiguous-text": "off",
          "jsx-a11y/anchor-has-content": "error",
          "jsx-a11y/anchor-is-valid": "error",
          "jsx-a11y/aria-activedescendant-has-tabindex": "error",
          "jsx-a11y/aria-props": "error",
          "jsx-a11y/aria-proptypes": "error",
          "jsx-a11y/aria-role": "error",
          "jsx-a11y/aria-unsupported-elements": "error",
          "jsx-a11y/autocomplete-valid": "error",
          "jsx-a11y/click-events-have-key-events": "error",
          "jsx-a11y/heading-has-content": "error",
          "jsx-a11y/html-has-lang": "error",
          "jsx-a11y/iframe-has-title": "error",
          "jsx-a11y/img-redundant-alt": "error",
          "jsx-a11y/interactive-supports-focus": "error",
          "jsx-a11y/label-has-associated-control": "error",
          "jsx-a11y/lang": "error",
          "jsx-a11y/media-has-caption": "error",
          "jsx-a11y/mouse-events-have-key-events": "error",
          "jsx-a11y/no-access-key": "error",
          "jsx-a11y/no-aria-hidden-on-focusable": "warn",
          "jsx-a11y/no-autofocus": "error",
          "jsx-a11y/no-distracting-elements": "error",
          "jsx-a11y/no-noninteractive-tabindex": "error",
          "jsx-a11y/no-redundant-roles": "error",
          "jsx-a11y/no-static-element-interactions": "error",
          "jsx-a11y/prefer-tag-over-role": "warn",
          "jsx-a11y/role-has-required-aria-props": "error",
          "jsx-a11y/role-supports-aria-props": "error",
          "jsx-a11y/scope": "error",
          "jsx-a11y/tabindex-no-positive": "error"
        },
        "plugins": [
          "jsx-a11y"
        ]
      },
      {
        "files": [
          "**/*.?(m|c)ts?(x)"
        ],
        "rules": {
          "class-methods-use-this": [
            "warn",
            {
              "ignoreOverrideMethods": true,
              "ignoreClassesThatImplementAnInterface": "public-fields"
            }
          ],
          "default-param-last": "error",
          "init-declarations": "off",
          "max-params": "off",
          "no-array-constructor": "off",
          "no-dupe-class-members": "error",
          "no-loop-func": "error",
          "no-magic-numbers": "off",
          "no-redeclare": "error",
          "no-restricted-imports": "off",
          "no-shadow": "error",
          "no-unused-expressions": "off",
          "no-unused-vars": [
            "error",
            {
              "vars": "local",
              "args": "none",
              "ignoreRestSiblings": true
            }
          ],
          "no-use-before-define": [
            "error",
            {
              "functions": true,
              "classes": true
            }
          ],
          "no-useless-constructor": "error",
          "typescript/adjacent-overload-signatures": "error",
          "typescript/array-type": [
            "error",
            {
              "default": "array-simple"
            }
          ],
          "typescript/ban-tslint-comment": "error",
          "typescript/class-literal-property-style": "off",
          "typescript/consistent-generic-constructors": "error",
          "typescript/consistent-indexed-object-style": "off",
          "typescript/consistent-type-assertions": [
            "error",
            {
              "assertionStyle": "as"
            }
          ],
          "typescript/consistent-type-definitions": [
            "error",
            "interface"
          ],
          "typescript/no-confusing-non-null-assertion": "error",
          "typescript/no-inferrable-types": [
            "warn",
            {
              "ignoreParameters": true,
              "ignoreProperties": true
            }
          ],
          "typescript/prefer-for-of": "warn",
          "typescript/prefer-function-type": "off",
          "typescript/ban-ts-comment": "off",
          "typescript/consistent-type-imports": "error",
          "typescript/explicit-function-return-type": "warn",
          "typescript/explicit-member-accessibility": "off",
          "typescript/explicit-module-boundary-types": [
            "warn"
          ],
          "typescript/no-duplicate-enum-values": "error",
          "typescript/no-dynamic-delete": "warn",
          "typescript/no-empty-object-type": [
            "warn",
            {
              "allowInterfaces": "with-single-extends"
            }
          ],
          "typescript/no-explicit-any": [
            "warn",
            {
              "ignoreRestArgs": true
            }
          ],
          "typescript/no-extra-non-null-assertion": "error",
          "typescript/no-extraneous-class": "off",
          "typescript/no-import-type-side-effects": "error",
          "typescript/no-invalid-void-type": "warn",
          "typescript/no-misused-new": "error",
          "typescript/no-namespace": [
            "error",
            {
              "allowDeclarations": true,
              "allowDefinitionFiles": true
            }
          ],
          "typescript/no-non-null-asserted-nullish-coalescing": "error",
          "typescript/no-non-null-asserted-optional-chain": "error",
          "typescript/no-non-null-assertion": "off",
          "typescript/no-require-imports": "warn",
          "typescript/no-restricted-types": "off",
          "typescript/no-this-alias": "error",
          "typescript/no-unnecessary-parameter-property-assignment": "warn",
          "typescript/no-unnecessary-type-constraint": "warn",
          "typescript/no-unsafe-declaration-merging": "error",
          "typescript/no-unsafe-function-type": "error",
          "typescript/no-useless-empty-export": "error",
          "typescript/no-wrapper-object-types": "warn",
          "typescript/parameter-properties": "off",
          "typescript/prefer-as-const": "warn",
          "typescript/prefer-enum-initializers": "error",
          "typescript/prefer-literal-enum-member": "error",
          "typescript/prefer-namespace-keyword": "off",
          "typescript/triple-slash-reference": [
            "error",
            {
              "types": "prefer-import"
            }
          ],
          "typescript/unified-signatures": "off"
        }
      },
      {
        "files": [
          "**/*.ts?(x)"
        ],
        "rules": {
          "default-param-last": "off",
          "init-declarations": "off",
          "no-array-constructor": "off",
          "no-dupe-class-members": "off",
          "no-duplicate-imports": "off",
          "no-empty-function": "off",
          "no-loop-func": "off",
          "no-loss-of-precision": "off",
          "no-magic-numbers": "off",
          "no-redeclare": "off",
          "no-shadow": "off",
          "no-throw-literal": "off",
          "no-unused-expressions": "off",
          "no-unused-vars": "off",
          "no-use-before-define": "off",
          "no-useless-constructor": "off",
          "require-await": "off",
          "typescript/dot-notation": "off"
        }
      },
      {
        "files": [
          "**/*.{spec,test}.{j,t}s?(x)"
        ],
        "rules": {
          "typescript/explicit-function-return-type": "off"
        }
      },
      {
        "files": [
          "**/*.?(m|c)ts?(x)"
        ],
        "rules": {
          "no-throw-literal": "off",
          "prefer-destructuring": "off",
          "prefer-promise-reject-errors": "off",
          "require-await": "off",
          "typescript/non-nullable-type-assertion-style": "warn",
          "typescript/prefer-find": "error",
          "typescript/prefer-includes": "error",
          "typescript/prefer-nullish-coalescing": [
            "error",
            {
              "ignoreConditionalTests": true,
              "ignoreMixedLogicalExpressions": true
            }
          ],
          "typescript/prefer-optional-chain": "error",
          "typescript/prefer-regexp-exec": "error",
          "typescript/prefer-string-starts-ends-with": "warn",
          "typescript/await-thenable": "error",
          "typescript/consistent-type-exports": "off",
          "typescript/no-array-delete": "error",
          "typescript/no-base-to-string": "error",
          "typescript/no-confusing-void-expression": [
            "error",
            {
              "ignoreArrowShorthand": true
            }
          ],
          "typescript/no-deprecated": "warn",
          "typescript/no-duplicate-type-constituents": "error",
          "typescript/no-floating-promises": [
            "error",
            {
              "ignoreIIFE": true
            }
          ],
          "typescript/no-for-in-array": "error",
          "typescript/no-meaningless-void-operator": "error",
          "typescript/no-misused-promises": "error",
          "typescript/no-misused-spread": "error",
          "typescript/no-mixed-enums": "error",
          "typescript/no-redundant-type-constituents": "error",
          "typescript/no-unnecessary-boolean-literal-compare": "warn",
          "typescript/no-unnecessary-condition": "warn",
          "typescript/no-unnecessary-qualifier": "warn",
          "typescript/no-unnecessary-template-expression": "warn",
          "typescript/no-unnecessary-type-arguments": "warn",
          "typescript/no-unnecessary-type-assertion": "warn",
          "typescript/no-unnecessary-type-conversion": "warn",
          "typescript/no-unnecessary-type-parameters": "warn",
          "typescript/no-unsafe-argument": "off",
          "typescript/no-unsafe-assignment": "off",
          "typescript/no-unsafe-call": "off",
          "typescript/no-unsafe-enum-comparison": "warn",
          "typescript/no-unsafe-member-access": "off",
          "typescript/no-unsafe-return": "off",
          "typescript/no-unsafe-type-assertion": "warn",
          "typescript/no-unsafe-unary-minus": "error",
          "typescript/prefer-readonly": "off",
          "typescript/prefer-readonly-parameter-types": "off",
          "typescript/prefer-reduce-type-parameter": "warn",
          "typescript/prefer-return-this-type": "error",
          "typescript/promise-function-async": [
            "error",
            {
              "allowedPromiseNames": [
                "Thenable"
              ],
              "checkArrowFunctions": true,
              "checkFunctionDeclarations": true,
              "checkFunctionExpressions": true,
              "checkMethodDeclarations": true
            }
          ],
          "typescript/related-getter-setter-pairs": "warn",
          "typescript/require-array-sort-compare": "warn",
          "typescript/restrict-plus-operands": "error",
          "typescript/restrict-template-expressions": "warn",
          "typescript/return-await": "error",
          "typescript/strict-boolean-expressions": "off",
          "typescript/switch-exhaustiveness-check": "warn",
          "typescript/unbound-method": [
            "warn",
            {
              "ignoreStatic": true
            }
          ],
          "typescript/use-unknown-in-catch-callback-variable": "warn",
          "typescript/dot-notation": "off",
          "typescript/consistent-return": "off",
          "typescript/no-implied-eval": "error",
          "typescript/only-throw-error": "error",
          "typescript/prefer-promise-reject-errors": "error",
          "typescript/require-await": "error"
        }
      },
      {
        "files": [
          "**/*.{spec,test}.{j,t}s?(x)"
        ],
        "rules": {
          "vitest/consistent-test-filename": "off",
          "vitest/consistent-test-it": "error",
          "vitest/expect-expect": [
            "error",
            {
              "assertFunctionNames": [
                "expect",
                "expect*"
              ]
            }
          ],
          "vitest/max-expects": "off",
          "vitest/max-nested-describe": "off",
          "vitest/no-alias-methods": "warn",
          "vitest/no-commented-out-tests": "warn",
          "vitest/no-conditional-expect": "warn",
          "vitest/no-conditional-in-test": "warn",
          "vitest/no-conditional-tests": "warn",
          "vitest/no-disabled-tests": "warn",
          "vitest/no-duplicate-hooks": "error",
          "vitest/no-focused-tests": "error",
          "vitest/no-hooks": "off",
          "vitest/no-identical-title": "error",
          "vitest/no-import-node-test": "error",
          "vitest/no-interpolation-in-snapshots": "error",
          "vitest/no-large-snapshots": [
            "warn",
            {
              "maxSize": 32
            }
          ],
          "vitest/no-mocks-import": "error",
          "vitest/no-restricted-matchers": "off",
          "vitest/no-restricted-vi-methods": "warn",
          "vitest/no-standalone-expect": "error",
          "vitest/no-test-prefixes": "error",
          "vitest/no-test-return-statement": "error",
          "vitest/prefer-called-with": "warn",
          "vitest/prefer-comparison-matcher": "warn",
          "vitest/prefer-describe-function-title": "off",
          "vitest/prefer-each": "warn",
          "vitest/prefer-equality-matcher": "warn",
          "vitest/prefer-expect-assertions": "off",
          "vitest/prefer-expect-resolves": "warn",
          "vitest/prefer-hooks-in-order": "warn",
          "vitest/prefer-hooks-on-top": "warn",
          "vitest/prefer-lowercase-title": "warn",
          "vitest/prefer-mock-promise-shorthand": "warn",
          "vitest/prefer-snapshot-hint": "warn",
          "vitest/prefer-spy-on": "warn",
          "vitest/prefer-strict-boolean-matchers": "warn",
          "vitest/prefer-strict-equal": "off",
          "vitest/prefer-to-be": "off",
          "vitest/prefer-to-be-falsy": "off",
          "vitest/prefer-to-be-object": "warn",
          "vitest/prefer-to-be-truthy": "off",
          "vitest/prefer-to-contain": "warn",
          "vitest/prefer-to-have-length": "warn",
          "vitest/prefer-todo": "warn",
          "vitest/require-local-test-context-for-concurrent-snapshots": "warn",
          "vitest/require-mock-type-parameters": "warn",
          "vitest/require-to-throw-message": "off",
          "vitest/require-top-level-describe": "error",
          "vitest/valid-describe-callback": "error",
          "vitest/valid-expect": "error",
          "vitest/valid-expect-in-promise": "error",
          "vitest/valid-title": "error"
        },
        "plugins": [
          "vitest"
        ]
      },
      {
        "files": [
          "*.stories.{j,t}s?(x)",
          "*.config.?(m|c){j,t}s"
        ],
        "rules": {
          "import/no-default-export": "off",
          "import/no-anonymous-default-export": "off"
        }
      }
    ]
  },
  fmt: {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "none",
    bracketSpacing: true,
    jsxBracketSameLine: false,
    sortPackageJson: false,
    ignorePatterns: [],
  },
});
