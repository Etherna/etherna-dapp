declare module "@ffmpeg/ffmpeg" {
  type CreateFFmpegOptions = {
    log?: boolean
  }

  type FFmpegOutput = {
    buffer: ArrayBuffer
  }

  export function createFFmpeg(options?: CreateFFmpegOptions): FFmpeg

  export interface FFmpeg {
    load: () => void
    write: (filename: string, file: File) => void
    transcode: (inputFilename: string, outputFilename: string, args?: string) => void
    read: (outputFilename: string) => FFmpegOutput
    remove: (outputFilename: string) => void
  }
}
