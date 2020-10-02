import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import * as getRawBody from 'raw-body';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NotePermissionsUpdateDto } from '../../../notes/note-permissions.dto';
import { NotesService } from '../../../notes/notes.service';
import { RevisionsService } from '../../../revisions/revisions.service';

@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private revisionsService: RevisionsService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  /**
   * Extract the raw markdown from the request body and create a new note with it
   *
   * Implementation inspired by https://stackoverflow.com/questions/52283713/how-do-i-pass-plain-text-as-my-request-body-using-nestjs
   */
  @Post()
  async createNote(@Req() req: Request) {
    // we have to check req.readable because of raw-body issue #57
    // https://github.com/stream-utils/raw-body/issues/57
    if (req.readable) {
      let bodyText: string = await getRawBody(req, 'utf-8');
      bodyText = bodyText.trim();
      this.logger.debug('Got raw markdown:\n' + bodyText);
      return this.noteService.createNoteDto(bodyText);
    } else {
      // TODO: Better error message
      throw new BadRequestException('Invalid body');
    }
  }

  @Get(':noteIdOrAlias')
  getNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.getNoteDtoByIdOrAlias(noteIdOrAlias);
  }

  @Post(':noteAlias')
  async createNamedNote(
    @Param('noteAlias') noteAlias: string,
    @Req() req: Request,
  ) {
    // we have to check req.readable because of raw-body issue #57
    // https://github.com/stream-utils/raw-body/issues/57
    if (req.readable) {
      let bodyText: string = await getRawBody(req, 'utf-8');
      bodyText = bodyText.trim();
      this.logger.debug('Got raw markdown:\n' + bodyText);
      return this.noteService.createNoteDto(bodyText, noteAlias);
    } else {
      // TODO: Better error message
      throw new BadRequestException('Invalid body');
    }
  }

  @Delete(':noteIdOrAlias')
  async deleteNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    this.logger.debug('Deleting note: ' + noteIdOrAlias);
    await this.noteService.deleteNoteByIdOrAlias(noteIdOrAlias);
    this.logger.debug('Successfully deleted ' + noteIdOrAlias);
    return;
  }

  @Put(':noteIdOrAlias')
  async updateNote(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Req() req: Request,
  ) {
    // we have to check req.readable because of raw-body issue #57
    // https://github.com/stream-utils/raw-body/issues/57
    if (req.readable) {
      let bodyText: string = await getRawBody(req, 'utf-8');
      bodyText = bodyText.trim();
      this.logger.debug('Got raw markdown:\n' + bodyText);
      return this.noteService.updateNoteByIdOrAlias(noteIdOrAlias, bodyText);
    } else {
      // TODO: Better error message
      throw new BadRequestException('Invalid body');
    }
  }

  @Get(':noteIdOrAlias/content')
  @Header('content-type', 'text/markdown')
  getNoteContent(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.getNoteContent(noteIdOrAlias);
  }

  @Get(':noteIdOrAlias/metadata')
  getNoteMetadata(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.getNoteMetadata(noteIdOrAlias);
  }

  @Put(':noteIdOrAlias/permissions')
  updateNotePermissions(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() updateDto: NotePermissionsUpdateDto,
  ) {
    return this.noteService.updateNotePermissions(noteIdOrAlias, updateDto);
  }

  @Get(':noteIdOrAlias/revisions')
  getNoteRevisions(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.revisionsService.getNoteRevisionMetadatas(noteIdOrAlias);
  }

  @Get(':noteIdOrAlias/revisions/:revisionId')
  getNoteRevision(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('revisionId') revisionId: number,
  ) {
    return this.revisionsService.getNoteRevision(noteIdOrAlias, revisionId);
  }
}
