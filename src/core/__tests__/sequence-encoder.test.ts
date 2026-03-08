import { describe, it, expect } from 'vitest';
import { SequenceEncoder, SequenceDecoder } from '../sequence-encoder';

describe('SequenceEncoder', () => {
  describe('basic encode/decode round-trip', () => {
    it('encodes and decodes a simple string', () => {
      const se = new SequenceEncoder(',');
      se.append('hello');
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextToken()).toBe('hello');
    });

    it('encodes and decodes multiple strings', () => {
      const se = new SequenceEncoder(',');
      se.append('A').append('B').append('C');
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextToken()).toBe('A');
      expect(sd.nextToken()).toBe('B');
      expect(sd.nextToken()).toBe('C');
    });
  });

  describe('empty/null strings', () => {
    it('encodes null as empty', () => {
      const se = new SequenceEncoder(',');
      se.append(null);
      expect(se.getValue()).toBe('');
    });

    it('encodes empty string as empty', () => {
      const se = new SequenceEncoder(',');
      se.append('');
      expect(se.getValue()).toBe('');
    });

    it('decodes empty token as empty string', () => {
      const sd = new SequenceDecoder('', ',');
      expect(sd.nextToken()).toBe('');
      expect(sd.hasMoreTokens()).toBe(false);
    });

    it('initial null bug 3465 — null followed by value', () => {
      const se = SequenceEncoder.withInitialValue(null, ';');
      se.append('value');
      const sd = new SequenceDecoder(se.getValue(), ';');
      expect(sd.nextToken()).toBe('');
      expect(sd.nextToken()).toBe('value');
    });
  });

  describe('strings containing the delimiter', () => {
    it('escapes delimiter in the middle', () => {
      const value = 'How many ,\'s in this sentence?\n';
      const se = new SequenceEncoder(',');
      se.append(value);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextToken()).toBe(value);
    });

    it('encodes string starting with delimiter', () => {
      const value = ',hahahahah';
      const se = new SequenceEncoder(',');
      se.append(value);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextToken()).toBe(value);
    });
  });

  describe('strings starting with backslash', () => {
    it('wraps in single quotes', () => {
      const se = new SequenceEncoder(',');
      se.append('\\test');
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextToken()).toBe('\\test');
    });
  });

  describe('strings enclosed in single quotes', () => {
    it('wraps already-quoted strings', () => {
      const se = new SequenceEncoder(',');
      se.append("'hello'");
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextToken()).toBe("'hello'");
    });

    it('unquotes single-quoted values from raw input', () => {
      const sd = new SequenceDecoder("'12345'", ',');
      expect(sd.nextToken()).toBe('12345');
    });

    it('single quote bug 2481', () => {
      const sd = new SequenceDecoder("stuff,'", ',');
      expect(sd.nextToken()).toBe('stuff');
      expect(sd.nextToken()).toBe("'");
    });
  });

  describe('nested encoding (A,B\\,C example from docs)', () => {
    it('encodes nested structure', () => {
      const inner = SequenceEncoder.withInitialValue('B', ',');
      inner.append('C');
      const outer = SequenceEncoder.withInitialValue('A', ',');
      outer.append(inner.getValue()!);
      expect(outer.getValue()).toBe('A,B\\,C');
    });

    it('decodes nested structure', () => {
      const st = new SequenceDecoder('A,B\\,C', ',');
      const A = st.nextToken();
      expect(A).toBe('A');
      const bc = new SequenceDecoder(st.nextToken(), ',');
      expect(bc.nextToken()).toBe('B');
      expect(bc.nextToken()).toBe('C');
    });
  });

  describe('boolean encoding/decoding', () => {
    it('round-trips true', () => {
      const se = new SequenceEncoder(',');
      se.appendBoolean(true);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextBoolean(false)).toBe(true);
    });

    it('round-trips false', () => {
      const se = new SequenceEncoder(',');
      se.appendBoolean(false);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextBoolean(true)).toBe(false);
    });
  });

  describe('int encoding/decoding', () => {
    it('round-trips an integer', () => {
      const se = new SequenceEncoder(',');
      se.appendInt(42);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextInt(999)).toBe(42);
    });
  });

  describe('double encoding/decoding', () => {
    it('round-trips a double', () => {
      const se = new SequenceEncoder(',');
      se.appendDouble(3.1415926535);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextDouble(99.9)).toBe(3.1415926535);
    });

    it('round-trips NaN', () => {
      const se = new SequenceEncoder(',');
      se.appendDouble(NaN);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextDouble(99.9)).toBeNaN();
    });

    it('round-trips Infinity', () => {
      const se = new SequenceEncoder(',');
      se.appendDouble(Infinity);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextDouble(99.9)).toBe(Infinity);
    });

    it('round-trips -Infinity', () => {
      const se = new SequenceEncoder(',');
      se.appendDouble(-Infinity);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextDouble(99.9)).toBe(-Infinity);
    });
  });

  describe('long encoding/decoding', () => {
    it('round-trips a long', () => {
      const se = new SequenceEncoder(',');
      se.appendLong(167772173);
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextLong(999)).toBe(167772173);
    });
  });

  describe('multiple tokens decoded in sequence', () => {
    it('decodes mixed types in order', () => {
      const se = new SequenceEncoder(',');
      se.appendBoolean(true)
        .appendInt(42)
        .appendDouble(3.14)
        .append('hello');
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextBoolean(false)).toBe(true);
      expect(sd.nextInt(0)).toBe(42);
      expect(sd.nextDouble(0)).toBe(3.14);
      expect(sd.nextToken()).toBe('hello');
      expect(sd.hasMoreTokens()).toBe(false);
    });
  });

  describe('default values when tokens exhausted', () => {
    it('returns default for nextToken', () => {
      const sd = new SequenceDecoder('a', ',');
      sd.nextToken(); // consume
      expect(sd.nextToken('default')).toBe('default');
    });

    it('returns default for nextInt', () => {
      const sd = new SequenceDecoder('a', ',');
      sd.nextToken(); // consume
      expect(sd.nextInt(42)).toBe(42);
    });

    it('returns default for nextDouble', () => {
      const sd = new SequenceDecoder('a', ',');
      sd.nextToken(); // consume
      expect(sd.nextDouble(3.14)).toBe(3.14);
    });

    it('returns default for nextBoolean', () => {
      const sd = new SequenceDecoder('a', ',');
      sd.nextToken(); // consume
      expect(sd.nextBoolean(true)).toBe(true);
    });

    it('returns default for nextChar', () => {
      const sd = new SequenceDecoder('a', ',');
      sd.nextToken(); // consume
      expect(sd.nextChar('X')).toBe('X');
    });

    it('throws when nextToken called with no default and exhausted', () => {
      const sd = new SequenceDecoder('a', ',');
      sd.nextToken();
      expect(() => sd.nextToken()).toThrow();
    });

    it('returns default for nextInt when token is not a number', () => {
      const sd = new SequenceDecoder('abc', ',');
      expect(sd.nextInt(42)).toBe(42);
    });
  });

  describe('getValue()', () => {
    it('returns null when nothing appended', () => {
      const se = new SequenceEncoder(',');
      expect(se.getValue()).toBeNull();
    });
  });

  describe('fluent API', () => {
    it('returns this from all append methods', () => {
      const se = new SequenceEncoder(',');
      expect(se.append('a')).toBe(se);
      expect(se.appendInt(1)).toBe(se);
      expect(se.appendDouble(1.0)).toBe(se);
      expect(se.appendBoolean(true)).toBe(se);
      expect(se.appendChar('x')).toBe(se);
      expect(se.appendLong(1)).toBe(se);
    });
  });

  describe('char encoding', () => {
    it('encodes backslash char in quotes', () => {
      const se = new SequenceEncoder(',');
      se.appendChar('\\');
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextChar('x')).toBe('\\');
    });

    it('encodes single-quote char in quotes', () => {
      const se = new SequenceEncoder(',');
      se.appendChar("'");
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextChar('x')).toBe("'");
    });

    it('encodes delimiter char with escape', () => {
      const se = new SequenceEncoder(',');
      se.appendChar(',');
      const sd = new SequenceDecoder(se.getValue(), ',');
      expect(sd.nextChar('x')).toBe(',');
    });
  });

  describe('ugly delimiter', () => {
    it('handles numeric delimiter with int', () => {
      const se = new SequenceEncoder('0');
      se.appendInt(100).appendInt(200);
      const sd = new SequenceDecoder(se.getValue(), '0');
      expect(sd.nextInt(-1)).toBe(100);
      expect(sd.nextInt(-1)).toBe(200);
    });
  });

  describe('decoder copy', () => {
    it('copies from start', () => {
      const se = new SequenceEncoder(',');
      se.appendInt(1).append('blah blah blah,,,').append(null).appendInt(42);

      const sd1 = new SequenceDecoder(se.getValue(), ',');
      const sd2 = sd1.copy();

      expect(sd1.nextInt(-1)).toBe(sd2.nextInt(-2));
      expect(sd1.nextToken('x')).toBe(sd2.nextToken('y'));
      expect(sd1.nextToken('x')).toBe(sd2.nextToken('y'));
      expect(sd1.nextInt(-1)).toBe(sd2.nextInt(-2));
      expect(sd1.hasNext()).toBe(false);
      expect(sd2.hasNext()).toBe(false);
    });

    it('copies from middle', () => {
      const se = new SequenceEncoder(',');
      se.appendInt(1).append('blah blah blah,,,').append(null).appendInt(42);

      const sd1 = new SequenceDecoder(se.getValue(), ',');
      sd1.nextToken();
      sd1.nextToken();

      const sd2 = sd1.copy();

      expect(sd1.nextToken('x')).toBe(sd2.nextToken('y'));
      expect(sd1.nextInt(-1)).toBe(sd2.nextInt(-2));
      expect(sd1.hasNext()).toBe(false);
      expect(sd2.hasNext()).toBe(false);
    });
  });

  describe('getRemaining', () => {
    it('returns remaining unparsed string', () => {
      const sd = new SequenceDecoder('A,B,C', ',');
      sd.nextToken();
      expect(sd.getRemaining()).toBe('B,C');
    });

    it('returns empty when exhausted', () => {
      const sd = new SequenceDecoder('A', ',');
      sd.nextToken();
      expect(sd.getRemaining()).toBe('');
    });
  });

  describe('iterable', () => {
    it('supports for-of iteration', () => {
      const se = new SequenceEncoder(',');
      se.append('A').append('B').append('C');
      const results: string[] = [];
      for (const token of new SequenceDecoder(se.getValue(), ',')) {
        results.push(token);
      }
      expect(results).toEqual(['A', 'B', 'C']);
    });
  });
});
