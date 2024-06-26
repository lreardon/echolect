# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turbo::Streams::ActionBroadcastJob`.
# Please instead update this file by running `bin/tapioca dsl Turbo::Streams::ActionBroadcastJob`.


class Turbo::Streams::ActionBroadcastJob
  class << self
    sig do
      params(
        stream: T.untyped,
        action: T.untyped,
        target: T.untyped,
        rendering: T.untyped,
        block: T.nilable(T.proc.params(job: Turbo::Streams::ActionBroadcastJob).void)
      ).returns(T.any(Turbo::Streams::ActionBroadcastJob, FalseClass))
    end
    def perform_later(stream, action:, target:, **rendering, &block); end

    sig { params(stream: T.untyped, action: T.untyped, target: T.untyped, rendering: T.untyped).returns(T.untyped) }
    def perform_now(stream, action:, target:, **rendering); end
  end
end
