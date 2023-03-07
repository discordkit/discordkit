export interface ActivityParty {
  /** the id of the party */
  id?: string;
  /** (current_size, max_size)	used to show the party's current and maximum size */
  size?: [currentSize: number, maxSize: number];
}
