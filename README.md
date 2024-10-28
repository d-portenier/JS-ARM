# JS-ARM
Building a JS Compiler for ARM. Fully Book: [Compiling to Assembly from Scratch](https://keleshev.com/compiling-to-assembly-from-scratch/)

## Requirements
- TypeScript pipeline, e.g. npm/npx
- Arm Assembler: arm-linux-gnuabihf-gcc
- qemu-user (if you don't have an ARM cpu)


## Pipeline
To test the full pipeline, given all needed tools are installed, do the following:
```sh
$ npx tsc #transpile TS to JS
$ node index.js >test.s # Compile the "source code" defined inside index.ts
$ arm-linux-gnueabihf-gcc -static test.s -o test # Assemble
$ ./test # execute, if not working, use the following:
$ qemu-arm ./test # execute
```

## The Language
The language is a very (very!) simple subset of JS. No globals, no for, etc...

