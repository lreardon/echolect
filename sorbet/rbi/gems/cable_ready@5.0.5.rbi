# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `cable_ready` gem.
# Please instead update this file by running `bin/tapioca gem cable_ready`.


# source://cable_ready//lib/cable_ready/identifiable.rb#5
module CableReady
  class << self
    # source://cable_ready//lib/cable_ready.rb#21
    def config; end

    # @yield [config]
    #
    # source://cable_ready//lib/cable_ready.rb#25
    def configure; end

    # source://cable_ready//lib/cable_ready.rb#29
    def signed_stream_verifier; end
  end
end

class CableReady::BroadcastJob < ::ActiveJob::Base
  include ::CableReady::Identifiable
  include ::CableReady::Broadcaster

  def perform(identifier:, operations:, model: T.unsafe(nil)); end
end

# source://cable_ready//lib/cable_ready/broadcaster.rb#6
module CableReady::Broadcaster
  include ::CableReady::Identifiable
  extend ::ActiveSupport::Concern

  # source://cable_ready//lib/cable_ready/broadcaster.rb#14
  def cable_car; end

  # source://cable_ready//lib/cable_ready/broadcaster.rb#10
  def cable_ready; end
end

# source://cable_ready//lib/cable_ready/cable_car.rb#6
class CableReady::CableCar < ::CableReady::OperationBuilder
  extend ::Thread::Local

  # @return [CableCar] a new instance of CableCar
  #
  # source://cable_ready//lib/cable_ready/cable_car.rb#9
  def initialize; end

  # source://cable_ready//lib/cable_ready/cable_car.rb#13
  def dispatch(clear: T.unsafe(nil)); end
end

# source://cable_ready//lib/cable_ready/channel.rb#4
class CableReady::Channel < ::CableReady::OperationBuilder
  # source://cable_ready//lib/cable_ready/channel.rb#7
  def broadcast(clear: T.unsafe(nil)); end

  # source://cable_ready//lib/cable_ready/channel.rb#29
  def broadcast_later(clear: T.unsafe(nil), queue: T.unsafe(nil)); end

  # source://cable_ready//lib/cable_ready/channel.rb#37
  def broadcast_later_to(model, clear: T.unsafe(nil), queue: T.unsafe(nil)); end

  # source://cable_ready//lib/cable_ready/channel.rb#18
  def broadcast_to(model, clear: T.unsafe(nil)); end

  # Returns the value of attribute identifier.
  #
  # source://cable_ready//lib/cable_ready/channel.rb#5
  def identifier; end
end

# This class is a thread local singleton: CableReady::Channels.instance
# SEE: https://github.com/socketry/thread-local/tree/master/guides/getting-started
#
# source://cable_ready//lib/cable_ready/channels.rb#10
class CableReady::Channels
  include ::CableReady::Compoundable
  extend ::Thread::Local

  # @return [Channels] a new instance of Channels
  #
  # source://cable_ready//lib/cable_ready/channels.rb#14
  def initialize; end

  # source://cable_ready//lib/cable_ready/channels.rb#18
  def [](*keys); end

  # source://cable_ready//lib/cable_ready/channels.rb#24
  def broadcast(*identifiers, clear: T.unsafe(nil)); end

  # source://cable_ready//lib/cable_ready/channels.rb#34
  def broadcast_to(model, *identifiers, clear: T.unsafe(nil)); end
end

# source://cable_ready//lib/cable_ready/compoundable.rb#4
module CableReady::Compoundable
  # source://cable_ready//lib/cable_ready/compoundable.rb#5
  def compound(keys); end
end

# This class is a process level singleton shared by all threads: CableReady::Config.instance
#
# source://cable_ready//lib/cable_ready/config.rb#11
class CableReady::Config
  include ::MonitorMixin
  include ::Observable
  include ::Singleton
  extend ::Singleton::SingletonClassMethods

  # @return [Config] a new instance of Config
  #
  # source://cable_ready//lib/cable_ready/config.rb#27
  def initialize; end

  # source://cable_ready//lib/cable_ready/config.rb#48
  def add_operation_name(name); end

  # Returns the value of attribute broadcast_job_queue.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def broadcast_job_queue; end

  # Sets the attribute broadcast_job_queue
  #
  # @param value the value to set the attribute broadcast_job_queue to.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def broadcast_job_queue=(_arg0); end

  # source://cable_ready//lib/cable_ready/config.rb#55
  def default_operation_names; end

  # source://cable_ready//lib/cable_ready/config.rb#36
  def observers; end

  # Returns the value of attribute on_failed_sanity_checks.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def on_failed_sanity_checks; end

  # Sets the attribute on_failed_sanity_checks
  #
  # @param value the value to set the attribute on_failed_sanity_checks to.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def on_failed_sanity_checks=(_arg0); end

  # source://cable_ready//lib/cable_ready/config.rb#19
  def on_new_version_available; end

  # source://cable_ready//lib/cable_ready/config.rb#23
  def on_new_version_available=(_); end

  # source://cable_ready//lib/cable_ready/config.rb#44
  def operation_names; end

  # Returns the value of attribute precompile_assets.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def precompile_assets; end

  # Sets the attribute precompile_assets
  #
  # @param value the value to set the attribute precompile_assets to.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def precompile_assets=(_arg0); end

  # Returns the value of attribute updatable_debounce_adapter.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def updatable_debounce_adapter; end

  # Sets the attribute updatable_debounce_adapter
  #
  # @param value the value to set the attribute updatable_debounce_adapter to.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def updatable_debounce_adapter=(_arg0); end

  # Returns the value of attribute updatable_debounce_time.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def updatable_debounce_time; end

  # Sets the attribute updatable_debounce_time
  #
  # @param value the value to set the attribute updatable_debounce_time to.
  #
  # source://cable_ready//lib/cable_ready/config.rb#16
  def updatable_debounce_time=(_arg0); end

  # source://cable_ready//lib/cable_ready/config.rb#40
  def verifier_key; end

  # Sets the attribute verifier_key
  #
  # @param value the value to set the attribute verifier_key to.
  #
  # source://cable_ready//lib/cable_ready/config.rb#17
  def verifier_key=(_arg0); end

  class << self
    private

    def allocate; end
    def new(*_arg0); end
  end
end

# source://cable_ready//lib/cable_ready/engine.rb#6
class CableReady::Engine < ::Rails::Engine
  class << self
    # source://activesupport/7.1.3.4/lib/active_support/callbacks.rb#70
    def __callbacks; end
  end
end

# If you don't want to precompile CableReady's assets (eg. because you're using webpack),
# you can do this in an initializer:
#
# config.after_initialize do
#   config.assets.precompile -= CableReady::Engine::PRECOMPILE_ASSETS
# end
#
# source://cable_ready//lib/cable_ready/engine.rb#13
CableReady::Engine::PRECOMPILE_ASSETS = T.let(T.unsafe(nil), Array)

# source://cable_ready//lib/cable_ready/identifiable.rb#6
module CableReady::Identifiable
  # source://cable_ready//lib/cable_ready/identifiable.rb#7
  def dom_id(record, prefix = T.unsafe(nil)); end

  # @return [Boolean]
  #
  # source://cable_ready//lib/cable_ready/identifiable.rb#25
  def identifiable?(obj); end

  private

  # @return [Boolean]
  #
  # source://cable_ready//lib/cable_ready/identifiable.rb#42
  def ar_base?(obj); end

  # @return [Boolean]
  #
  # source://cable_ready//lib/cable_ready/identifiable.rb#36
  def ar_relation?(obj); end
end

# source://cable_ready//lib/cable_ready/operation_builder.rb#4
class CableReady::OperationBuilder
  include ::CableReady::Identifiable

  # @return [OperationBuilder] a new instance of OperationBuilder
  #
  # source://cable_ready//lib/cable_ready/operation_builder.rb#15
  def initialize(identifier); end

  # source://cable_ready//lib/cable_ready/operation_builder.rb#24
  def add_operation_method(name); end

  # source://cable_ready//lib/cable_ready/operation_builder.rb#65
  def apply!(operations = T.unsafe(nil)); end

  # Returns the value of attribute identifier.
  #
  # source://cable_ready//lib/cable_ready/operation_builder.rb#6
  def identifier; end

  # source://cable_ready//lib/cable_ready/operation_builder.rb#75
  def operations_payload; end

  # Returns the value of attribute previous_selector.
  #
  # source://cable_ready//lib/cable_ready/operation_builder.rb#6
  def previous_selector; end

  # Returns the value of attribute previous_xpath.
  #
  # source://cable_ready//lib/cable_ready/operation_builder.rb#6
  def previous_xpath; end

  # source://cable_ready//lib/cable_ready/operation_builder.rb#79
  def reset!; end

  # source://cable_ready//lib/cable_ready/operation_builder.rb#61
  def to_json(*args); end

  class << self
    # source://cable_ready//lib/cable_ready/operation_builder.rb#8
    def finalizer_for(identifier); end
  end
end

# source://cable_ready//lib/cable_ready/sanity_checker.rb#3
class CableReady::SanityChecker
  private

  # @return [Boolean]
  #
  # source://cable_ready//lib/cable_ready/sanity_checker.rb#29
  def initializer_missing?; end

  # source://cable_ready//lib/cable_ready/sanity_checker.rb#33
  def warn_and_exit(text); end

  class << self
    # source://cable_ready//lib/cable_ready/sanity_checker.rb#7
    def check!; end

    private

    # @return [Boolean]
    #
    # source://cable_ready//lib/cable_ready/sanity_checker.rb#18
    def called_by_generate_config?; end

    # @return [Boolean]
    #
    # source://cable_ready//lib/cable_ready/sanity_checker.rb#22
    def called_by_rake?; end
  end
end

# source://cable_ready//lib/cable_ready/sanity_checker.rb#4
CableReady::SanityChecker::LATEST_VERSION_FORMAT = T.let(T.unsafe(nil), Regexp)

class CableReady::Stream < ::ActionCable::Channel::Base
  include ::CableReady::StreamIdentifier

  def subscribed; end

  class << self
    # source://activesupport/7.1.3.4/lib/active_support/callbacks.rb#70
    def __callbacks; end
  end
end

# source://cable_ready//lib/cable_ready/stream_identifier.rb#4
module CableReady::StreamIdentifier
  # source://cable_ready//lib/cable_ready/stream_identifier.rb#9
  def signed_stream_identifier(compoundable); end

  # source://cable_ready//lib/cable_ready/stream_identifier.rb#5
  def verified_stream_identifier(signed_stream_identifier); end
end

module CableReady::Updatable
  extend ::ActiveSupport::Concern

  mixes_in_class_methods ::CableReady::Updatable::ClassMethods
end

module CableReady::Updatable::ClassMethods
  include ::CableReady::Compoundable

  def broadcast_updates(model_class, options); end
  def build_options(option); end
  def cable_ready_collections; end
  def cable_ready_update_collection(resource, name, model, debounce: T.unsafe(nil)); end
  def enrich_association_with_updates(name, option, descendants = T.unsafe(nil), debounce: T.unsafe(nil)); end
  def enrich_attachments_with_updates(name, option, debounce: T.unsafe(nil)); end
  def has_many(name, scope = T.unsafe(nil), **options, &extension); end
  def has_many_attached(name, **options); end
  def has_one(name, scope = T.unsafe(nil), **options, &extension); end
  def skip_updates_classes; end
end

class CableReady::Updatable::Collection < ::Struct
  def debounce_time; end
  def debounce_time=(_); end
  def foreign_key; end
  def foreign_key=(_); end
  def inverse_association; end
  def inverse_association=(_); end
  def klass; end
  def klass=(_); end
  def name; end
  def name=(_); end
  def options; end
  def options=(_); end
  def reflection; end
  def reflection=(_); end
  def through_association; end
  def through_association=(_); end

  class << self
    def [](*_arg0); end
    def inspect; end
    def keyword_init?; end
    def members; end
    def new(*_arg0); end
  end
end

class CableReady::Updatable::CollectionUpdatableCallbacks
  def initialize(operation); end

  def after_commit(model); end

  private

  def update_collections(model); end
end

class CableReady::Updatable::CollectionsRegistry
  def initialize; end

  def broadcast_for!(model, operation); end
  def register(collection); end

  private

  def find_resource_for_update(collection, model); end
end

class CableReady::Updatable::MemoryCacheDebounceAdapter
  include ::Singleton
  extend ::Singleton::SingletonClassMethods

  def initialize; end

  def [](key); end
  def []=(key, value); end

  # source://activesupport/7.1.3.4/lib/active_support/core_ext/module/delegation.rb#331
  def method_missing(method, *args, **_arg2, &block); end

  private

  # source://activesupport/7.1.3.4/lib/active_support/core_ext/module/delegation.rb#323
  def respond_to_missing?(name, include_private = T.unsafe(nil)); end

  class << self
    private

    def allocate; end
    def new(*_arg0); end
  end
end

class CableReady::Updatable::ModelUpdatableCallbacks
  def initialize(operation, enabled_operations = T.unsafe(nil), debounce: T.unsafe(nil)); end

  def after_commit(model); end

  private

  def broadcast_create(model); end
  def broadcast_destroy(model); end
  def broadcast_update(model); end
end

# source://cable_ready//lib/cable_ready/version.rb#4
CableReady::VERSION = T.let(T.unsafe(nil), String)

module CableReady::ViewHelper
  include ::CableReady::Compoundable
  include ::CableReady::StreamIdentifier

  def cable_car; end
  def cable_ready_stream_from(*keys, html_options: T.unsafe(nil)); end
  def cable_ready_updates_for(*keys, url: T.unsafe(nil), debounce: T.unsafe(nil), only: T.unsafe(nil), ignore_inner_updates: T.unsafe(nil), observe_appearance: T.unsafe(nil), html_options: T.unsafe(nil), &block); end
  def cable_ready_updates_for_if(condition, *keys, **options, &block); end
  def stream_from(*_arg0, **_arg1, &_arg2); end
  def updates_for(*_arg0, **_arg1, &_arg2); end
  def updates_for_if(*_arg0, **_arg1, &_arg2); end

  private

  def build_options(*keys, html_options); end
end

# source://cable_ready//lib/cable_ready_helper.rb#7
module CableReadyHelper
  include ::CableReady::ViewHelper

  class << self
    # @private
    #
    # source://cable_ready//lib/cable_ready_helper.rb#8
    def included(base); end
  end
end

module ExtendHasMany
  extend ::ActiveSupport::Concern

  mixes_in_class_methods ::ExtendHasMany::ClassMethods
end

module ExtendHasMany::ClassMethods
  def has_many(*args, &block); end
end