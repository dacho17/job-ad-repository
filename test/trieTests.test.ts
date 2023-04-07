import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
import { Organization } from 'src/database/models/organization';
import { mock, instance } from 'ts-mockito';
import { Inject } from 'typedi';
import ArbeitNowJobParser from '../src/dataLayer/parsers/arbeitNowJobParser';
import TrieNode from '../src/helpers/parser/trieNode';
import { TrieWordType } from '../src/helpers/enums/trieWordType';
import constants from '../src/helpers/constants';

_chai.should();

@suite
class TrieTestSuite {
    private trie = new TrieNode(constants.EMPTY_STRING, []);

    before() {
        ['- remote', 'remote'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.IS_REMOTE);
        });
        this.trie.addEntry('student', TrieWordType.IS_STUDENT);
        ['mid-senior', 'junior', 'senior'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.SENIORITY);
        });
        ['full time', 'full-time', 'permanent', 'part time', 'part-time'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.TIME_ENGAGEMENT);
        });
        this.trie.addEntry('salary icon', TrieWordType.REDUNDANT);
        this.trie.addEntry(' (eur)', TrieWordType.REDUNDANT);
    }

    @test
    setIsRemoteAndFormatDetails() {
        expect(this.trie.checkIfEntryPresent('- remote')[1] === 4);
        expect(this.trie.checkIfEntryPresent('remote')[1] === 4);
        expect(this.trie.checkIfEntryPresent('fulltime')[1] === 3);
  }
}