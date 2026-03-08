/**
 * TypeScript port of VASSAL's SequenceEncoder.
 * 
 * VASSAL uses this to serialize/deserialize trait definitions.
 * The format uses semicolons and commas as delimiters with backslash escaping.
 * 
 * Source reference: vassal-app/src/main/java/VASSAL/tools/SequenceEncoder.java
 * 
 * TODO: Port from Java source — this is Phase 1, Task 1.
 */

export class SequenceEncoder {
  private parts: string[] = [];
  private separator: string;

  constructor(separator: string = ',') {
    this.separator = separator;
  }

  append(value: string): SequenceEncoder {
    // TODO: implement encoding with proper escaping
    this.parts.push(value);
    return this;
  }

  appendBoolean(value: boolean): SequenceEncoder {
    return this.append(value ? 'true' : 'false');
  }

  appendInt(value: number): SequenceEncoder {
    return this.append(String(Math.floor(value)));
  }

  getValue(): string {
    return this.parts.join(this.separator);
  }
}

export class SequenceDecoder {
  private parts: string[];
  private index: number = 0;

  constructor(encoded: string, separator: string = ',') {
    // TODO: implement decoding with proper unescaping
    this.parts = encoded.split(separator);
  }

  nextToken(defaultValue: string = ''): string {
    if (this.index < this.parts.length) {
      return this.parts[this.index++];
    }
    return defaultValue;
  }

  nextBoolean(defaultValue: boolean = false): boolean {
    const token = this.nextToken();
    return token ? token === 'true' : defaultValue;
  }

  nextInt(defaultValue: number = 0): number {
    const token = this.nextToken();
    return token ? parseInt(token, 10) : defaultValue;
  }

  hasMoreTokens(): boolean {
    return this.index < this.parts.length;
  }
}
