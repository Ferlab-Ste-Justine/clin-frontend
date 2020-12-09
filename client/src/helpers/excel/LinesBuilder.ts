type Line = {
    bold?: boolean;
    value: string;
} | string;

export class LinesBuilder {
    private readonly content: Line[] = [];

    append(...entries: Line[]) {
      entries.forEach((entry) => {
        if (entry != null) {
          this.content.push(entry);
        }
      });
      this.newLine();
    }

    newLine() {
      this.content.push('\n');
    }

    build() {
      return this.content;
    }
}
