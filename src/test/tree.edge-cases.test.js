import { describe, it, expect } from 'vitest'
import { tree, parseTree, tokenize, renderTree } from '../js/tree.js'

describe('Edge cases и граничные условия', () => {
  describe('Токенизация', () => {
    it('обрабатывает одиночные символы', () => {
      expect(tokenize('(A)')).toEqual(['(', 'A', ')'])
    })

    it('обрабатывает числа как значения', () => {
      expect(tokenize('(1 2 3)')).toEqual(['(', '1', '2', '3', ')'])
    })

    it('обрабатывает длинные строки без пробелов', () => {
      expect(tokenize('(ABC DEF GHI)')).toEqual(['(', 'ABC', 'DEF', 'GHI', ')'])
    })

    it('обрабатывает смешанные пробелы и табы', () => {
      expect(tokenize('(\tA  \n B\t\tC  \n)')).toEqual(['(', 'A', 'B', 'C', ')'])
    })
  })

  describe('Парсинг сложных структур', () => {
    it('парсит дерево только с листьями', () => {
      const result = parseTree('(ROOT A B C D E)')
      expect(result.value).toBe('ROOT')
      expect(result.children).toHaveLength(5)
      result.children.forEach((child) => {
        expect(child.children).toHaveLength(0)
      })
    })

    it('парсит глубоко вложенное дерево', () => {
      const result = parseTree('(A (B (C (D (E F)))))')
      let current = result
      const expectedValues = ['A', 'B', 'C', 'D', 'E']

      expectedValues.forEach((value) => {
        expect(current.value).toBe(value)
        if (value !== 'E') {
          expect(current.children).toHaveLength(1)
          current = current.children[0]
        } else {
          expect(current.children).toHaveLength(1)
          expect(current.children[0].value).toBe('F')
        }
      })
    })

    it('парсит несбалансированное дерево', () => {
      const result = parseTree('(A (B C D) E (F (G H I J) K) L)')
      expect(result.value).toBe('A')
      expect(result.children).toHaveLength(4)

      // Проверяем левое поддерево
      expect(result.children[0].value).toBe('B')
      expect(result.children[0].children).toHaveLength(2)

      // Проверяем одиночный узел
      expect(result.children[1].value).toBe('E')
      expect(result.children[1].children).toHaveLength(0)

      // Проверяем сложное правое поддерево
      expect(result.children[2].value).toBe('F')
      expect(result.children[2].children).toHaveLength(2)
      expect(result.children[2].children[0].value).toBe('G')
      expect(result.children[2].children[0].children).toHaveLength(3)
    })
  })

  describe('Отрисовка сложных структур', () => {
    it('отрисовывает дерево с одним длинным путем', () => {
      const root = tree('A')
      const b = tree('B')
      const c = tree('C')
      const d = tree('D')

      root.addChild(b)
      b.addChild(c)
      c.addChild(d)

      const result = renderTree(root)
      expect(result).toBe('A---+\n    B---+\n    |   C---+\n    |   |   D')
    })

    it('отрисовывает дерево с множественными ветвями', () => {
      const root = tree('ROOT')
      const branches = ['B1', 'B2', 'B3', 'B4'].map(tree)
      branches.forEach((branch) => root.addChild(branch))

      const result = renderTree(root)
      expect(result).toBe('ROOT---+\n    B1\n    B2\n    B3\n    B4')
    })

    it('отрисовывает смешанную структуру', () => {
      const root = tree('A')
      const b = tree('B')
      const c = tree('C')
      const d = tree('D')
      const e = tree('E')

      b.addChild(tree('B1'))
      b.addChild(tree('B2'))
      c.addChild(tree('C1'))

      root.addChild(b)
      root.addChild(c)
      root.addChild(d)
      root.addChild(e)

      const result = renderTree(root)
      const expected = 'A---+\n    B---+\n    |   B1\n    |   B2\n    C---+\n    |   C1\n    D\n    E'
      expect(result).toBe(expected)
    })
  })

  describe('Обработка ошибок', () => {
    it('выбрасывает ошибки для различных неправильных форматов', () => {
      const invalidInputs = [
        { input: '(()', message: 'Ожидается значение узла' },
        { input: '())', message: 'Ожидается значение узла' },
        { input: '(A (B)', message: 'Ожидается закрывающая скобка' },
        { input: '(A B) C', message: 'Дерево должно начинаться с "(" и заканчиваться ")"' },
        { input: 'A (B C)', message: 'Дерево должно начинаться с "(" и заканчиваться ")"' }
      ]

      invalidInputs.forEach(({ input, message }) => {
        expect(() => parseTree(input)).toThrow()
      })
    })

    it('корректно обрабатывает пустые входные данные', () => {
      expect(() => parseTree('')).toThrow()
      expect(() => parseTree('   ')).toThrow()
      expect(() => parseTree('\t\n')).toThrow()
    })
  })

  describe('Производительность и стресс-тесты', () => {
    it('обрабатывает дерево средней глубины', () => {
      // Создаем дерево глубиной 10
      let input = '(A'
      for (let i = 0; i < 10; i++) {
        input += ' (B' + i
      }
      for (let i = 0; i < 10; i++) {
        input += ' C' + i + ')'
      }
      input += ')'

      expect(() => parseTree(input)).not.toThrow()
      const result = parseTree(input)
      expect(result.value).toBe('A')
    })

    it('обрабатывает широкое дерево', () => {
      // Создаем дерево с множеством детей
      const children = Array.from({ length: 50 }, (_, i) => `CHILD${i}`).join(' ')
      const input = `(ROOT ${children})`

      const result = parseTree(input)
      expect(result.value).toBe('ROOT')
      expect(result.children).toHaveLength(50)

      result.children.forEach((child, i) => {
        expect(child.value).toBe(`CHILD${i}`)
      })
    })
  })

  describe('Интеграция с реальными примерами', () => {
    it('обрабатывает пример файловой системы', () => {
      const input = '(root (home (user documents downloads)) (var (log tmp)) (usr (bin lib)))'
      const result = parseTree(input)
      const rendered = renderTree(result)

      expect(result.value).toBe('root')
      expect(rendered).toContain('root---+')
      expect(rendered).toContain('home---+')
      expect(rendered).toContain('var---+')
      expect(rendered).toContain('usr---+')
    })

    it('обрабатывает пример организационной структуры', () => {
      const input = '(CEO (CTO (DevTeam Engineer1 Engineer2) (QATeam Tester1)) (CFO (Accounting Finance)))'
      const result = parseTree(input)

      expect(result.value).toBe('CEO')
      expect(result.children).toHaveLength(2)
      expect(result.children[0].value).toBe('CTO')
      expect(result.children[1].value).toBe('CFO')

      const rendered = renderTree(result)
      expect(rendered).toContain('CEO---+')
    })

    it('обрабатывает математическое выражение в виде дерева', () => {
      const input = '(+ (* 2 3) (/ 8 4))'
      const result = parseTree(input)
      const rendered = renderTree(result)

      expect(result.value).toBe('+')
      expect(rendered).toBe('+---+\n    *---+\n    |   2\n    |   3\n    /---+\n    |   8\n    |   4')
    })
  })
})
