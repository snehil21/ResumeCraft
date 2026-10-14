declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*?url' {
  const url: string;
  export default url;
}

declare module 'mammoth/mammoth.browser' {
  interface MammothMessage {
    message: string;
  }

  const mammoth: {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{
      value: string;
      messages: MammothMessage[];
    }>;
    convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{
      value: string;
      messages: MammothMessage[];
    }>;
  };

  export default mammoth;
}
