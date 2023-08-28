import { mkdirSync, writeFileSync } from "fs";
import { BN } from 'bn.js';

export class WorldNBT {
    view: DataView;
    offset: number;
    type: number;
    length: number;
    worldDat: WorldDat;

    constructor(file: Buffer) {
        this.view = new DataView(file.buffer, file.byteOffset, file.byteLength);

        this.offset = 0;
        this.type = this.view.getUint32(this.offset, true);
        this.length = this.view.getUint32(this.offset + 4, true);
        this.offset += 8;

        let type = this.getNextByte();

        this.worldDat = {};
        this.worldDat[this.getNextString()] = {
            type: type,
            data: this.getCompound()
        };
    }

    getNextString(): string {
        let nameLength = this.getNextShort();
        let name = "";
        for(let i = 0; i < nameLength; i++) {
            name += String.fromCharCode(this.getNextByte());
        }
        return name;
    }

    getNextByte(): number {
        this.offset++;
        return this.view.getUint8(this.offset - 1);
    }

    getNextShort(): number {
        this.offset += 2;
        return this.view.getUint16(this.offset - 2, true);
    }

    getNextInt(): number {
        this.offset += 4;
        return this.view.getUint32(this.offset - 4, true);
    }

    getNextLong(): string {
        this.offset += 8;
        const lowWord = this.view.getUint32(this.offset - 8, true);
        const highWord = this.view.getUint32(this.offset - 4, true);
        let value = highWord * 4294967296 + lowWord;
        let result = '';
        while (value > 0) {
            result = String.fromCharCode(value % 10 + 48) + result;
            value = Math.floor(value / 10);
        }
        return result || '0';
    }

    getNextFloat(): number {
        this.offset += 4;
        return this.view.getFloat32(this.offset - 4, true);
    }

    getNextDouble(): number {
        this.offset += 8;
        return this.view.getFloat64(this.offset - 8, true);
    }

    getList(type: number): Array<number | string | Object> {
        let list = [];
        let count = this.getNextInt();
        for(let i = 0; i < count; i++) {
            switch(type) {
                case 1:
                    list.push(this.getNextByte());
                    break;
                case 2:
                    list.push(this.getNextShort());
                    break;
                case 3:
                    list.push(this.getNextInt());
                    break;
                case 4:
                    list.push(this.getNextLong());
                    break;
                case 5:
                    list.push(this.getNextFloat());
                    break;
                case 6:
                    list.push(this.getNextDouble().toString());
                    break;
                case 7:
                    list.push(this.getList(1));
                    break;
                case 8:
                    list.push(this.getNextString());
                    break;
                case 9:
                    list.push(this.getList(this.getNextInt()));
                    break;
                case 10:
                    list.push(this.getCompound());
                    break;
                case 11:
                    list.push(this.getList(3));
                    break;
                case 12:
                    list.push(this.getList(4));
                    break;
            }
        }
        return list;
    }

    getCompound() {
        let compound: Compound = {};
        while(true) {
            let byte = this.getNextByte();
            if(byte == 0) break;
            let name = this.getNextString();
            compound[name] = {
                type: byte
            };
            switch(byte) {
                case 1:
                    compound[name].data = this.getNextByte();
                    break;
                case 2:
                    compound[name].data = this.getNextShort();
                    break;
                case 3:
                    compound[name].data = this.getNextInt();
                    break;
                case 4:
                    compound[name].data = this.getNextLong();
                    break;
                case 5:
                    compound[name].data = this.getNextFloat();
                    break;
                case 6:
                    compound[name].data = this.getNextDouble().toString();
                    break;
                case 7:
                    compound[name].data = this.getList(1);
                    break;
                case 8:
                    compound[name].data = this.getNextString();
                    break;
                case 9:
                    let type = this.getNextByte();
                    compound[name].dataType = type;
                    compound[name].data = this.getList(type);
                    break;
                case 10:
                    compound[name].data = this.getCompound();
                    break;
                case 11:
                    compound[name].data = this.getList(3);
                    break;
                case 12:
                    compound[name].data = this.getList(4);
                    break;
            }
        }
        return compound;
    }

    writeWorld(){
        this.view = new DataView(new ArrayBuffer(this.view.byteLength));

        this.offset = 0;
        this.view.setUint32(this.offset, this.type, true);
        this.view.setUint32(this.offset + 4, this.length, true);
        this.offset += 8;

        this.setByte(10);
        this.setString("");

        this.setCompound(this.worldDat[""].data);

        try {
            mkdirSync(`worlds/${this.worldDat[""].data.LevelName.data}`);
        } catch {};
        writeFileSync(`worlds/${this.worldDat[""].data.LevelName.data}/l.dat`, this.view);
        writeFileSync(`worlds/${this.worldDat[""].data.LevelName.data}/level.dat`, this.view);
    }

    setString(string: string, update: boolean = false) {
        this.setShort(string.length);
        if(update) {
            const newarry = new Uint8Array(new ArrayBuffer(this.view.byteLength + string.length));
            newarry.set(new Uint8Array(this.view.buffer),0);
            this.view = new DataView(newarry.buffer, newarry.byteOffset, newarry.byteLength);
        }
        for(let i = 0; i < string.length; i++) {
            this.setByte(string.charCodeAt(i));
        }
    }

    setByte(byte: number) {
        this.offset++;
        this.view.setUint8(this.offset - 1, byte);
    }

    setShort(short: number) {
        this.offset += 2;
        this.view.setUint16(this.offset - 2, short, true);
    }

    setInt(int: number) {
        this.offset += 4;
        this.view.setUint32(this.offset - 4, int, true);
    }

    setLong(long: string): void {
        let bn = new BN(long, 10, 'le');
        let buff = bn.toBuffer('le', 8)
        for(let i = 0; i < buff.length; i++) {
            this.setByte(buff.subarray(buff.length - i - 1)[0])
        }
    }

    setFloat(float: number) {
        this.offset += 4;
        this.view.setFloat32(this.offset - 4, float, true);
    }

    setDouble(double: number) {
        this.offset += 8;
        this.view.setFloat64(this.offset - 8, double, true);
    }

    setList(list: Array<number | string | Object>, type: number) {
        if(type != 7 || type < 11) this.setByte(type);
        this.setInt(list.length);
        for(let i = 0; i < list.length; i++){
            switch(type) {
                case 1:
                    this.setByte(Number(list[i]));
                    break;
                case 2:
                    this.setShort(Number(list[i]));
                    break;
                case 3:
                    this.setInt(Number(list[i]));
                    break;
                case 4:
                    this.setLong(String(list[i]));
                    break;
                case 5:
                    this.setFloat(Number(list[i]));
                    break;
                case 6:
                    this.setDouble(Number(list[i]));
                    break;
                case 7:
                    //this.setList(list[i], );
                    break;
                case 8:
                    this.setString(String(list[i]), true);
                    break;
                case 9:
                    //list.push(this.getList(this.getNextInt()));
                    break;
                case 10:
                    this.setCompound(Object(list[i]));
                    break;
                case 11:
                    //list.push(this.getList(3));
                    break;
                case 12:
                    //list.push(this.getList(4));
                    break;
            }
        }
    }

    setCompound(compound: Compound) {
        Object.keys(compound).forEach((key,i)=>{
            if(key == "type" || key == "data") return;
            this.setByte(compound[key].type);
            this.setString(key);
            switch(compound[key].type) {
                case 1:
                    this.setByte(compound[key].data);
                    break;
                case 2:
                    this.setShort(compound[key].data);
                    break;
                case 3:
                    this.setInt(compound[key].data);
                    break;
                case 4:
                    this.setLong(compound[key].data);
                    break;
                case 5:
                    this.setFloat(compound[key].data);
                    break;
                case 6:
                    this.setDouble(Number(compound[key].data));
                    break;
                case 7:
                    this.setList(compound[key].data, 1);
                    break;
                case 8:
                    this.setString(compound[key].data, (key == 'LevelName' || key == 'FlatWorldLayers') ? true : false);
                    break;
                case 9:
                    this.setList(compound[key].data, compound[key].dataType);
                    break;
                case 10:
                    this.setCompound(compound[key].data);
                    this.setByte(0);
                    break;
                case 11:
                    this.setList(compound[key].data, 3);
                    break;
                case 12:
                    this.setList(compound[key].data, 4);
                    break;
            }
        })
    }
}

interface WorldDat {
    [index: string]: any;
}

interface Compound {
    [index: string]: any;
}