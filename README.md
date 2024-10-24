# JS-ARM
Building a JS Compiler for ARM. Fully Book: [Compiling to Assembly from Scratch](https://keleshev.com/compiling-to-assembly-from-scratch/)


## Preparation

### JS
To run JS locally, use nodeJS. NVM (Node Version Manager) is very smooth to handle Node versions. As we're coding in type-scipt, I somehow ended up with the command: **npx tsc**, which transpiles type-script into java script.

### Assembling
Getting from Assmebly to executable is done with:
```sh
arm-linux-gnueabihf-gcc -static hello.s -o hello
./hello
```
The shell is smart enough, to invoke qemu-arm under the hood...
