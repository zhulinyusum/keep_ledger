"use client";

import { PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useJournalProgram,
  useJournalProgramAccount,
} from "./journal-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import Link from "next/link";


export function JournalCreate1() {
  const { createEntry } = useJournalProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  if (!publicKey) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">
          Connect your wallet to start journaling
        </p>
      </div>
    );
  }

  return (
      <Link href="/ledger/ledger-select">
      <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          New Ledger
        </h2>
               About
      </div>
      </Link>

  );
}

export function JournalCreate() {
  const { createEntry } = useJournalProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handleSubmit = () => {
      console.log("TYYYYYYYYYYYYY");
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">
          Connect your wallet to start journaling
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        New Journal Entry
      </h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-4 focus:ring-2 focus:ring-purple-500 transition-all"
      />
      <textarea
        placeholder="Write your thoughts..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full h-32 mb-4 focus:ring-2 focus:ring-purple-500 transition-all"
      />
      <button
        className={`btn w-full disabled:bg-red-100 disabled:text-blue-500 ${
          createEntry.isPending ? "btn-disabled bg-red-500 text-blue-500" : "bg-red-500 text-blue-500 hover:bg-red-600 btn-primary"
        } transition-transform hover:-translate-y-1`}
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        {createEntry.isPending ? (
          <span className="flex items-center justify-center">
            <span className="tbloading loading loading-spinner mr-2"></span>
            Creating...
          </span>
        ) : (
          "Create Entry"
        )}
      </button>
    </div>
  );
}

export function JournalList() {
  const { accounts, getProgramAccount } = useJournalProgram();
  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="tbloading loading loading-spinner loading-lg text-purple-500"></span>
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info max-w-2xl mx-auto">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {accounts.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <span className="tbloading loading loading-spinner loading-lg text-purple-500"></span>
        </div>
      ) : accounts.data?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.data?.map((account) => (
            <>
            <JournalCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
            <h2>JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJLLLLLLLLLLLLLLL</h2>
            </>

            
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            No entries yet
          </h2>
          <p className="text-gray-500">
            Create your first journal entry to get started
          </p>
        </div>
      )}
    </div>
  );
}

function JournalCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useJournalProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return (
      <p className="text-center p-4 text-gray-500">
        Connect your wallet to view entries
      </p>
    );
  }

  return accountQuery.isLoading ? (
    <div className="flex justify-center items-center h-48">
      <span className="tbloading loading loading-spinner loading-lg text-purple-500"></span>
    </div>
  ) : (
    <div className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 rounded-xl overflow-hidden">
      <div className="card-body p-6">
        <div className="space-y-4">
          <h2
            className="card-title text-2xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={() => accountQuery.refetch()}
          >
            {accountQuery.data?.title}
          </h2>

          <p className="text-gray-600 min-h-16">{accountQuery.data?.message}</p>

          <div className="card-actions flex-col">
            <textarea
              placeholder="Update your thoughts..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea textarea-bordered w-full mb-3 focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              className={`btn btn-block ${
                updateEntry.isPending ? "btn-disabled" : "btn-primary"
              } mb-3 transition-transform hover:-translate-y-0.5`}
              onClick={handleSubmit}
              disabled={updateEntry.isPending || !isFormValid}
            >
              {updateEntry.isPending ? (
                <span className="flex items-center justify-center">
                  <span className="tbloading loading loading-spinner mr-2"></span>
                  Updating...
                </span>
              ) : (
                "Update Entry"
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <div className="text-sm text-gray-500">
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
                className="hover:text-purple-600 transition-colors"
              />
            </div>
            <button
              className="btn btn-sm btn-outline btn-error transition-transform hover:-translate-y-0.5"
              onClick={() => {
                if (
                  !window.confirm("Are you sure you want to delete this entry?")
                ) {
                  return;
                }
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteEntry.mutateAsync(title);
                }
              }}
              disabled={deleteEntry.isPending}
            >
              {deleteEntry.isPending ? (
                <span className="flex items-center justify-center">
                  <span className="tbloading loading loading-spinner mr-2"></span>
                  Deleting...
                </span>
              ) : (
                "Delete Entry"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
