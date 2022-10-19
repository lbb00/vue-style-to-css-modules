import $ from 'gogocode'
import postcss from 'postcss'
import scss from 'node-sass'

export default function transform(code) {
  const ast = $(code, {
    parseOptions: {
      language: 'vue',
    },
  })

  const cssAst = postcss.parse(
    scss
      .renderSync({
        data: ast.rootNode.node.styles[0].content,
      })
      .css.toString()
  )

  const classNames = []
  cssAst.walkRules((rule) => {
    const classSelectors = rule.selector
      .split(' ')
      .filter((s) => s.startsWith('.'))
    classSelectors.forEach((i) => {
      const name = i.substring(1)
      if (classNames.indexOf(name) === -1) {
        classNames.push(name)
      }
    })
  })
  ast
    .find('<template></template>')
    .find([`<$_$ :class="$_$1" $$$0>$$$1</$_$>`, `<$_$ :class="$_$1" $$$0/>`])
    .each((node) => {
      const newContent = $(node.match[1][0].value)
        .find(`{$_$:$_$1}`)
        .each((n) => {
          n.match[0].forEach(({ value }) => {
            if (classNames.includes(value)) {
              n.replace(
                `{'${value}': $_$,$$$}`,
                `{[$style['__oo__${value}']]: $_$,$$$}`
              )
            }
          })
        })
        .root()
        .find(`"$_$"`)
        .each((n) => {
          const str = n.match[0][0].value
          if (str.startsWith('__oo__')) {
            n.match[0][0].node.value = str.replace('__oo__', '')
          }
          if (classNames.includes(str)) {
            n.replaceBy(`$style['${str}']`)
          }
        })
        .root()
        .generate()

      node.match[1][0].node.content = newContent.replace(/"/g, "'")
    })
    .root()
    .find('<template></template>')
    .find([`<$_$ class="$_$1" $$$1>$$$2</$_$>`, `<$_$ class="$_$1" $$$1/>`])
    .each((item) => {
      const classList = item.match[1][0].value.split(' ')
      let hasMatched = false
      classList.forEach((i, idx) => {
        if (classNames.includes(i)) {
          hasMatched = true
          classList[idx] = `$style['${i}']`
        }
      })
      if (hasMatched) {
        const newContentAst = $(JSON.stringify(classList))
        newContentAst.find(`'$_$'`).each((n) => {
          const str = n.match[0][0].value
          if (str.startsWith('$style')) {
            n.replaceBy(str)
          }
        })
        if (
          newContentAst.generate().startsWith('[') &&
          newContentAst.find(`[$_$]`).match[0].length === 1
        ) {
          newContentAst.replace(`[$_$]`, `$_$`)
        }
        item.node.content.attributes.find((i) => {
          if (i.key.content === 'class') {
            i.key.content = ':class'
          }
        })
        item.match[1][0].node.content = newContentAst.generate().replace(/"/g, "'")
      }
    })

  ast.rootNode.node.styles[0].content = cssAst.toString()
  ast.rootNode.node.styles[0].attrs.module = true
  return ast.generate({
    isPretty: true,
  })
}
