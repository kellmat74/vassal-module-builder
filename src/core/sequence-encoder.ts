/**
 * TypeScript port of VASSAL's SequenceEncoder.
 *
 * Encodes a sequence of values into a single delimited string with
 * backslash escaping. Mirrors the Java implementation in
 * vassal-app/src/main/java/VASSAL/tools/SequenceEncoder.java
 */

// Characters that can appear in string representations of numbers/booleans.
// When the delimiter is one of these, numeric/boolean appends must go through
// the string-escaping path.
const UGLY = '-.0123456789EINaefilnrstuy';

export class SequenceEncoder {
  private buffer: string | null = null;
  private readonly delim: string;
  private readonly uglyDelim: boolean;

  constructor(delimiter: string = ',') {
    this.delim = delimiter;
    this.uglyDelim = UGLY.includes(delimiter);
  }

  /**
   * Construct with an initial string value.
   */
  static withInitialValue(val: string | null, delimiter: string = ','): SequenceEncoder {
    const se = new SequenceEncoder(delimiter);
    se.append(val);
    return se;
  }

  private startBufferOrAddDelimiter(): void {
    if (this.buffer === null) {
      this.buffer = '';
    } else {
      this.buffer += this.delim;
    }
  }

  append(s: string | null): SequenceEncoder {
    this.startBufferOrAddDelimiter();

    if (s === null || s.length === 0) {
      return this;
    }

    if (
      s.charAt(0) === '\\' ||
      (s.charAt(0) === '\'' && s.charAt(s.length - 1) === '\'')
    ) {
      this.buffer += '\'';
      this.appendEscapedString(s);
      this.buffer += '\'';
    } else {
      this.appendEscapedString(s);
    }

    return this;
  }

  private appendEscapedChar(c: string): void {
    if (c === this.delim) {
      this.buffer += '\\';
    }
    this.buffer += c;
  }

  appendChar(c: string): SequenceEncoder {
    this.startBufferOrAddDelimiter();

    if (c === '\\' || c === '\'') {
      this.buffer += '\'';
      this.appendEscapedChar(c);
      this.buffer += '\'';
    } else {
      this.appendEscapedChar(c);
    }

    return this;
  }

  appendInt(i: number): SequenceEncoder {
    if (this.uglyDelim) {
      return this.append(String(i));
    }
    this.startBufferOrAddDelimiter();
    this.buffer += String(i);
    return this;
  }

  appendLong(l: number): SequenceEncoder {
    // In JS, longs are just numbers
    return this.appendInt(l);
  }

  appendDouble(d: number): SequenceEncoder {
    if (this.uglyDelim) {
      return this.append(String(d));
    }
    this.startBufferOrAddDelimiter();
    this.buffer += String(d);
    return this;
  }

  appendBoolean(b: boolean): SequenceEncoder {
    if (this.uglyDelim) {
      return this.append(String(b));
    }
    this.startBufferOrAddDelimiter();
    this.buffer += String(b);
    return this;
  }

  getValue(): string | null {
    return this.buffer;
  }

  private appendEscapedString(s: string): void {
    let begin = 0;
    let end = s.indexOf(this.delim);

    while (begin <= end) {
      this.buffer += s.substring(begin, end) + '\\';
      begin = end;
      end = s.indexOf(this.delim, end + 1);
    }

    this.buffer += s.substring(begin);
  }
}

export class SequenceDecoder implements Iterable<string> {
  private val: string | null;
  private readonly delim: string;
  private buf: string | null = null;
  private start: number;
  private readonly stop: number;

  constructor(value: string | null, delimiter: string = ',') {
    this.val = value;
    this.delim = delimiter;
    this.start = 0;
    this.stop = this.val !== null ? this.val.length : 0;
  }

  /**
   * Copy constructor
   */
  private static fromDecoder(d: SequenceDecoder): SequenceDecoder {
    const copy = new SequenceDecoder(null);
    copy.val = d.val;
    (copy as unknown as { delim: string }).delim = d.delim;
    copy.start = d.start;
    (copy as unknown as { stop: number }).stop = d.stop;
    copy.buf = d.buf;
    return copy;
  }

  hasMoreTokens(): boolean {
    return this.val !== null;
  }

  getRemaining(): string {
    if (!this.hasMoreTokens()) {
      return '';
    }
    return this.val!.substring(this.start, this.stop);
  }

  nextToken(defaultValue?: string): string {
    if (defaultValue !== undefined && this.val === null) {
      return defaultValue;
    }

    if (this.val === null) {
      throw new Error('No more tokens');
    }

    if (this.start === this.stop) {
      this.val = null;
      return '';
    }

    if (this.buf !== null) {
      this.buf = '';
    }

    let tok: string | null = null;
    let i = this.start;
    for (; i < this.stop; ++i) {
      if (this.val.charAt(i) === this.delim) {
        if (i > 0 && this.val.charAt(i - 1) === '\\') {
          // escaped delimiter
          if (this.buf === null) {
            this.buf = '';
          }
          this.buf += this.val.substring(this.start, i - 1);
          this.start = i;
        } else {
          // real delimiter
          if (this.buf === null || this.buf.length === 0) {
            tok = this.val.substring(this.start, i);
          } else {
            this.buf += this.val.substring(this.start, i);
          }
          this.start = i + 1;
          break;
        }
      }
    }

    if (this.start < i) {
      // reached end without delimiter
      if (this.buf === null || this.buf.length === 0) {
        tok = this.val.substring(this.start);
      } else {
        this.buf += this.val.substring(this.start, this.stop);
      }
      this.val = null;
    }

    return this.unquote(tok !== null ? tok : this.buf!);
  }

  private unquote(s: string): string {
    const len = s.length;
    if (len > 1 && s.charAt(0) === '\'' && s.charAt(len - 1) === '\'') {
      return s.substring(1, len - 1);
    }
    return s;
  }

  nextInt(defaultValue: number): number {
    if (this.val !== null) {
      const parsed = parseInt(this.nextToken(), 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return defaultValue;
  }

  nextLong(defaultValue: number): number {
    return this.nextInt(defaultValue);
  }

  nextDouble(defaultValue: number): number {
    if (this.val !== null) {
      const tok = this.nextToken();
      const parsed = Number(tok);
      if (!isNaN(parsed) || tok === 'NaN') {
        return parsed;
      }
    }
    return defaultValue;
  }

  nextBoolean(defaultValue: boolean): boolean {
    return this.val !== null ? this.nextToken() === 'true' : defaultValue;
  }

  nextChar(defaultValue: string): string {
    if (this.val !== null) {
      const s = this.nextToken();
      return s.length > 0 ? s.charAt(0) : defaultValue;
    }
    return defaultValue;
  }

  hasNext(): boolean {
    return this.hasMoreTokens();
  }

  copy(): SequenceDecoder {
    return SequenceDecoder.fromDecoder(this);
  }

  [Symbol.iterator](): Iterator<string> {
    return {
      next: (): IteratorResult<string> => {
        if (this.hasMoreTokens()) {
          return { value: this.nextToken(), done: false };
        }
        return { value: undefined as unknown as string, done: true };
      },
    };
  }
}
