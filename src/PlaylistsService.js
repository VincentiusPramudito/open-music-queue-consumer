const { Pool } = require("pg");

class PlaylistsService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT
    });
  }

  async getPlaylists(userId) {
    const queryPlaylists = {
      text: `SELECT playlists.id, playlists.name FROM playlists
      LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id
      WHERE playlists.owner = $1`,
      values: [userId],
    };
    const resultPlaylists = await this._pool.query(queryPlaylists);

    if (resultPlaylists.rows.length) {
      resultPlaylists.rows[0].songs = [];
      const playlistId = resultPlaylists.rows[0].id;

      const query = {
        text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
        INNER JOIN songs ON playlist_songs.song_id = songs.id
        WHERE playlist_songs.playlist_id = $1`,
        values: [playlistId]
      };
      const result = await this._pool.query(query);

      if (result.rows.length) {
        resultPlaylists.rows[0].songs = [...result.rows];
      }
    }
    return {
      playlist: resultPlaylists.rows[0]
    };
  }
}

module.exports = PlaylistsService;