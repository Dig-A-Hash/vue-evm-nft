/**
 * Represents an ABI input parameter.
 */
export interface AbiInput {
  internalType: string;
  name: string;
  type: string;
}

/**
 * Represents an ABI output parameter.
 */
export interface AbiOutput {
  internalType: string;
  name: string;
  type: string;
}

/**
 * Represents an ABI error definition.
 */
export interface AbiError {
  name: string;
  type: 'error';
  inputs?: AbiInput[];
}

/**
 * Represents an ABI function definition.
 */
export interface AbiFunction {
  name: string;
  type: 'function';
  inputs?: AbiInput[];
  outputs?: AbiOutput[];
  stateMutability: 'nonpayable' | 'payable' | 'view' | 'pure';
}

/**
 * Represents an ABI event definition.
 */
export interface AbiEvent {
  name: string;
  type: 'event';
  anonymous?: boolean;
  inputs: Array<AbiInput & { indexed?: boolean }>;
}

/**
 * Represents an ABI constructor definition.
 */
export interface AbiConstructor {
  type: 'constructor';
  stateMutability: 'nonpayable' | 'payable';
  inputs?: AbiInput[];
}

/**
 * Represents a generic ABI item.
 */
export type AbiItem = AbiFunction | AbiEvent | AbiConstructor | AbiError;
